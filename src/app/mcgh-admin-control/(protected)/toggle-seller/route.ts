// src/app/mcgh-admin-control/toggle-seller/route.ts
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

	const { searchParams } = new URL(req.url);
	const sellerId = searchParams.get("sellerId");
	const active = searchParams.get("active") === "true";

	if (sellerId) {
		await adminFirestore.collection("sellers").doc(sellerId).update({ active });
	}

	return new NextResponse(null, { status: 302, headers: { Location: "/mcgh-admin-control" } });
}
