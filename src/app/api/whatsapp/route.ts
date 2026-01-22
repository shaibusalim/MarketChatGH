import { NextRequest } from "next/server";
import { TwilioMessagingResponse } from "@/lib/twilio";
import { adminFirestore } from "@/lib/firebase-admin";
import admin from "firebase-admin";
import { answerComplexQuery } from "@/ai/flows/answer-complex-queries";

export async function POST(req: NextRequest) {
  const twiml = new TwilioMessagingResponse();

  try {
    const formData = await req.formData();
    const body = (formData.get("Body") as string)?.trim() || "";
    const from = (formData.get("From") as string) || "";
    const messageSid = (formData.get("MessageSid") as string) || "";
    const numMedia = parseInt((formData.get("NumMedia") as string) || "0", 10);
    const mediaUrl = (formData.get("MediaUrl0") as string) || "";

    const sellerId = from.replace("whatsapp:+", "");
    if (!sellerId || sellerId.trim() === "") {
      console.error("Invalid sellerId", { from });
      twiml.message("⚠️ Invalid phone number format. Please contact support.");
      return new Response(twiml.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    console.log("Processing message", { sellerId, body, numMedia, mediaUrl, messageSid });

    const sellerRef = adminFirestore.collection("sellers").doc(sellerId);
    const sellerDoc = await sellerRef.get();

    if (!sellerDoc.exists || !sellerDoc.data()?.name || !sellerDoc.data()?.location) {
      console.warn("Seller not registered", { sellerId });
      twiml.message(
        "⚠️ You are not a registered seller. Please contact the admin to be onboarded."
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
      const imageUrl = mediaUrl;

      const mediaReference = {
        messageSid,
        originalUrl: mediaUrl,
      };

      const existingProducts = await adminFirestore
        .collection("products")
        .where("sellerId", "==", sellerId)
        .limit(1)
        .get();

      try {
        await adminFirestore.collection("products").add({
          sellerId,
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
        console.error("Failed to save product to adminFirestore", { error, sellerId, imageUrl });
        twiml.message("⚠️ Failed to add product. Please try again or contact support.");
        return new Response(twiml.toString(), {
          headers: { "Content-Type": "text/xml" },
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
      if (existingProducts.empty) {
        const storeUrl = `${baseUrl}/${sellerId}`;
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