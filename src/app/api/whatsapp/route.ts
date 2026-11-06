import { NextRequest } from "next/server";
import { TwilioMessagingResponse } from "@/lib/twilio";
import { adminFirestore, adminStorage } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";
import { parseProductCaption } from "@/ai/flows/parse-product-from-whatsapp";

export async function POST(req: NextRequest) {
  console.log("[WhatsApp] Webhook received POST request at", new Date().toISOString());
  const twiml = new TwilioMessagingResponse();

  try {
    const rawBody = await req.text();
    console.log("[WhatsApp] Raw request body:", rawBody);
    
    const params = new URLSearchParams(rawBody);
    const body = params.get("Body")?.trim() || "";
    const from = params.get("From") || "";
    const To = params.get("To") || "";
    const messageSid = params.get("MessageSid") || "";
    const numMedia = parseInt(params.get("NumMedia") || "0", 10);
    const mediaUrl = params.get("MediaUrl0") || "";

    console.log("[WhatsApp] Processing request from:", from, "to:", To);
    
    // Normalize phone number to match various possible formats in DB
    const cleanFrom = from.replace("whatsapp:+", "");
    
    // Generate potential formats to check in DB
    const phoneFormats = new Set<string>();
    phoneFormats.add(cleanFrom); // international format without + (e.g. 23324...)
    phoneFormats.add("+" + cleanFrom); // international with + (e.g. +23324...)
    
    if (cleanFrom.startsWith("233") && cleanFrom.length > 10) {
      phoneFormats.add("0" + cleanFrom.slice(3)); // local format (e.g. 024...)
    } else if (cleanFrom.startsWith("0") && cleanFrom.length === 10) {
      phoneFormats.add("233" + cleanFrom.slice(1)); // international no +
      phoneFormats.add("+233" + cleanFrom.slice(1)); // international with +
    }

    console.log("[WhatsApp] Checking phone formats in DB:", Array.from(phoneFormats));

    // Identify seller by phone number - Try all potential formats
    let sellersSnapshot = null;
    for (const phone of phoneFormats) {
      const snap = await adminFirestore.collection("sellers")
        .where("phone", "==", phone)
        .limit(1)
        .get();
      
      if (!snap.empty) {
        sellersSnapshot = snap;
        console.log("[WhatsApp] Matched seller with phone format:", phone);
        break;
      }
    }
    
    if (!sellersSnapshot || sellersSnapshot.empty) {
      console.warn("[WhatsApp] Seller not registered", { formats: Array.from(phoneFormats) });
      twiml.message(
        "⚠️ You are not a registered seller. Please contact the admin to be onboarded or sign up on our website."
      );
      return new Response(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    const sellerDoc = sellersSnapshot.docs[0];
    const sellerData = sellerDoc.data();
    const actualSellerId = sellerDoc.id;

    if (!sellerData.name || !sellerData.location) {
      console.warn("Seller profile incomplete", { actualSellerId });
      twiml.message(
        "⚠️ Your profile is incomplete. Please complete your registration on our website."
      );
      return new Response(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    if (numMedia > 0) {
      if (!body) {
        console.warn("Media received without caption", { actualSellerId, messageSid });
        twiml.message(
          "⚠️ Please include a product name, price, and description with your product image."
        );
        return new Response(twiml.toString(), {
          headers: { "Content-Type": "text/xml" },
        });
      }

      // Validate media URL
      if (!mediaUrl) {
        console.error("Media URL is missing", { actualSellerId, messageSid, numMedia });
        twiml.message(
          "⚠️ Unable to process image. Please try uploading again."
        );
        return new Response(twiml.toString(), {
          headers: { "Content-Type": "text/xml" },
        });
      }

      // Use AI to extract structured product data (title, category, clean price, compareAtPrice, description)
      const parsedProduct = await parseProductCaption(body);
      const title = parsedProduct.title || "Product";
      const category = parsedProduct.category || "General";
      const price = parsedProduct.price || "Price not specified";
      const compareAtPrice = parsedProduct.compareAtPrice || null;
      const description = parsedProduct.description || body;

      // FIX: Download from Twilio and upload to Firebase Storage to ensure persistence
      let imageUrl = mediaUrl;
      try {
        console.log("Attempting to download media from Twilio:", mediaUrl);
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (accountSid && authToken) {
          const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;

          const response = await fetch(mediaUrl, {
            headers: {
              'Authorization': authHeader
            }
          });

          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            const ext = contentType.split('/')[1] || 'jpg';
            const filename = `products/${actualSellerId}/${messageSid}_${Date.now()}.${ext}`;
            const bucket = adminStorage.bucket();
            const file = bucket.file(filename);

            await file.save(Buffer.from(buffer), {
              metadata: {
                contentType: contentType,
              }
            });

            const [signedUrl] = await file.getSignedUrl({
              action: 'read',
              expires: '03-01-2500',
            });

            imageUrl = signedUrl;
            console.log("Successfully uploaded to Firebase Storage:", imageUrl);
          } else {
            console.warn("Failed to fetch media from Twilio", { status: response.status });
          }
        }
      } catch (uploadError) {
        console.error("Error uploading media to Firebase:", uploadError);
      }

      const mediaReference = {
        messageSid,
        originalUrl: mediaUrl,
      };

      try {
        await adminFirestore.collection("products").add({
          sellerId: actualSellerId,
          title,
          name: title,
          category,
          price,
          compareAtPrice,
          description,
          imageUrl,
          mediaReference,
          status: "available",
          stockStatus: "in stock",
          isAvailable: true,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to save product to adminFirestore", { error, sellerId: actualSellerId, imageUrl });
        twiml.message("⚠️ Failed to add product. Please try again or contact support.");
        return new Response(twiml.toString(), {
          headers: { "Content-Type": "text/xml" },
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
      const storeUrl = `${baseUrl}/${sellerData.slug || actualSellerId}`;

      let replyMsg = `✅ *Product Added Successfully!*\n\n` +
        `📦 *Item:* ${title}\n` +
        `🏷️ *Category:* ${category}\n` +
        `💰 *Price:* GH₵${price}`;

      if (compareAtPrice) {
        replyMsg += ` _(Was GH₵${compareAtPrice})_`;
      }

      replyMsg += `\n\n🛍️ *View in your store:*\n${storeUrl}`;
      twiml.message(replyMsg);
    } else if (body) {
      try {
        const aiResult = await answerComplexQuery({ query: body });
        twiml.message(aiResult.reply);
      } catch (error) {
        console.error("AI processing failed", { error, query: body });
        twiml.message(
          "⚠️ Unable to process your request. Please try again or contact support."
        );
      }
    } else {
      console.warn("Empty message received", { actualSellerId, messageSid });
      twiml.message("⚠️ Please provide a message or product details.");
    }
  } catch (error) {
    console.error("Error processing WhatsApp message", { error });
    twiml.message("Oops! Something went wrong. Please try again later.");
  }

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
