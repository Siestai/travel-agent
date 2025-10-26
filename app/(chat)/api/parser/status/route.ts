import { NextResponse } from "next/server";
import { getInngestStatusByJobId } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing jobId parameter" },
      { status: 400 }
    );
  }

  try {
    const status = await getInngestStatusByJobId({ jobId });

    if (!status) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error getting parser status:", error);
    return NextResponse.json(
      { error: "Failed to get parser status" },
      { status: 500 }
    );
  }
}
