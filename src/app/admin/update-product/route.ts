// src/app/admin/update-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth.config'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	if (!session?.user?.isAdmin) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const formData = await req.formData();
	const productId = formData.get("productId") as string;
	const action = formData.get("action") as string;

	const productRef = adminFirestore.collection("products").doc(productId);

	if (action === "markAvailable") {
		await productRef.update({
			status: "available",
			stockStatus: "in stock",
			isAvailable: true,
		});
	} else if (action === "markOutOfStock") {
		await productRef.update({
			status: "out of stock",
			stockStatus: "out of stock",
			isAvailable: false,
		});
	} else if (action === "delete") {
		await productRef.delete();
	}

	return new NextResponse(null, { status: 302, headers: { Location: "/admin" } });
}
