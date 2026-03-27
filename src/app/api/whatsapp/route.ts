import { NextRequest } from "next/server";
import { TwilioMessagingResponse } from "@/lib/twilio";
import { adminFirestore, adminStorage } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";

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
        console.warn("Media received without caption", { sellerId, messageSid });
        twiml.message(
          "⚠️ Please include a description and price with your product image."
        );
        return new Response(twiml.toString(), {
          headers: { "Content-Type": "text/xml" },
        });
      }

      // Validate media URL
      if (!mediaUrl) {
        console.error("Media URL is missing", { sellerId, messageSid, numMedia });
        twiml.message(
          "⚠️ Unable to process image. Please try uploading again."
        );
        return new Response(twiml.toString(), {
          headers: { "Content-Type": "text/xml" },
        });
      }

      const lines = body.split("\n").map((line) => line.trim()).filter(Boolean);
      const priceLine = lines.find(
        (line) =>
          line.toLowerCase().includes("price") ||
          line.includes("₵") ||
          line.toLowerCase().includes("ghc")
      );
      const descriptionLines = lines.filter((line) => line !== priceLine);
      const description = descriptionLines.join("\n") || "No description provided";
      const price = priceLine || "Price not specified";

      // Use mediaUrl directly from Twilio - it's already a valid image URL
      // FIX: Download from Twilio and upload to Firebase Storage to ensure persistence
      let imageUrl = mediaUrl;
      try {
        console.log("Attempting to download media from Twilio:", mediaUrl);
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (accountSid && authToken) {
          // Construct the API URL for the media
          // The MediaUrl0 from form data is usually the public redirect URL or the API resource URL
          // If it is a direct URL, we might need to authenticate.

          const mediaId = mediaUrl.split('/').pop(); // Extract media SID if possible
          // If mediaUrl is like https://api.twilio.com/...

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
            const filename = `products/${sellerId}/${messageSid}_${Date.now()}.${ext}`;
            const bucket = adminStorage.bucket();
            const file = bucket.file(filename);

            await file.save(Buffer.from(buffer), {
              metadata: {
                contentType: contentType,
              }
            });

            // Make the file publicly accessible or sign it (long expiration)
            // Here we generate a long-lived signed URL
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
        // Fallback to original URL if upload fails, though it might broken later
      }

      const mediaReference = {
        messageSid,
        originalUrl: mediaUrl,
      };

      const existingProducts = await adminFirestore
        .collection("products")
        .where("sellerId", "==", actualSellerId)
        .limit(1)
        .get();

      try {
        await adminFirestore.collection("products").add({
          sellerId: actualSellerId,
          imageUrl,
          mediaReference,
          price,
          description,
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
      if (existingProducts.empty) {
        const storeUrl = `${baseUrl}/${sellerData.slug || actualSellerId}`;
        twiml.message(
          `✅ Product added successfully!\n\n🛍️ View your store: ${storeUrl}`
        );
      } else {
        twiml.message("✅ Product added successfully!");
      }
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
      console.warn("Empty message received", { sellerId, messageSid });
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