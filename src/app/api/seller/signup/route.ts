import { adminFirestore } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, "Password must include uppercase, lowercase, a number, and a special character");

const phoneSchema = z.string().regex(/^(\+233|0)[2-9]\d{8}$/, "Please enter a valid Ghanaian phone number");

export async function POST(req: Request) {
  try {
    const { name, email, password, location, phone } = await req.json();

    const validation = z.object({
      name: z.string().min(2, "Name is too short"),
      email: z.string().email("Invalid email address"),
      password: passwordSchema,
      location: z.string().min(3, "Location is too short"),
      phone: phoneSchema,
    }).safeParse({ name, email, password, location, phone });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const slug = generateSlug(name);

    // Check if seller already exists
    const sellerSnapshot = await adminFirestore
      .collection("sellers")
      .where("email", "==", emailLower)
      .limit(1)
      .get();

    if (!sellerSnapshot.empty) {
      const sellerDoc = sellerSnapshot.docs[0];
      const sellerData = sellerDoc.data();
      
      // If seller exists but has no password, they were likely onboarded by admin
      if (!sellerData.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sellerDoc.ref.update({
          password: hashedPassword,
          name: name || sellerData.name, // Update name if provided
          phone: phone || sellerData.phone,
          location: location || sellerData.location,
          slug: sellerData.slug || slug, // Update slug if not exists
          isApproved: sellerData.isApproved ?? false, // Keep existing approval status or default to false
          updatedAt: new Date(),
        });
        
        return NextResponse.json(
          { message: "Account claimed successfully! Your account is pending admin approval." },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller with pending approval
    const newSeller = {
      name,
      email: emailLower,
      password: hashedPassword,
      location,
      phone,
      slug,
      active: true,
      isApproved: false, // Needs admin approval
      createdAt: new Date(),
      role: "seller",
    };

    await adminFirestore.collection("sellers").add(newSeller);

    return NextResponse.json(
      { message: "Signup successful! Your account is pending admin approval." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Seller Signup API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
