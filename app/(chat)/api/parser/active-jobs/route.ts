import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getActiveParsingJobsForUser } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await getActiveParsingJobsForUser({ userId: session.user.id });
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error getting active parsing jobs:", error);
    return NextResponse.json(
      { error: "Failed to get active parsing jobs" },
      { status: 500 }
    );
  }
}
