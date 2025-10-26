import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getGoogleAccount } from "@/lib/db/queries";
import { decryptToken } from "@/lib/google/token-manager";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await getGoogleAccount({ userId: session.user.id });

    if (!account) {
      return NextResponse.json({ connected: false });
    }

    const decryptedEmail = decryptToken(account.email);

    return NextResponse.json({
      connected: true,
      email: decryptedEmail,
      createdAt: account.createdAt,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ connected: false });
  }
}
