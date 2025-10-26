import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  createTravel,
  getGoogleAccount,
  getTravels,
  setActiveTravel,
  updateTravel,
} from "@/lib/db/queries";
import {
  findFolderByName,
  initializeDriveClient,
} from "@/lib/google/drive-service";
import {
  createTravelFolder,
  ensureRootFolder,
} from "@/lib/google/folder-manager";
import { decryptToken } from "@/lib/google/token-manager";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const travels = await getTravels({ userId: session.user.id });

    return NextResponse.json({ travels });
  } catch (error) {
    console.error("Error fetching travels:", error);
    return NextResponse.json(
      { error: "Failed to fetch travels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const account = await getGoogleAccount({ userId: session.user.id });

    if (!account) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 401 }
      );
    }

    const decryptedAccessToken = decryptToken(account.accessToken);
    const driveClient = initializeDriveClient(decryptedAccessToken);

    const rootFolderId = await ensureRootFolder(driveClient);

    const existingFolder = await findFolderByName(
      driveClient,
      name,
      rootFolderId
    );

    let driveFolderId: string;

    if (existingFolder?.id) {
      driveFolderId = existingFolder.id;
    } else {
      // createTravelFolder returns the folder ID string directly
      driveFolderId = await createTravelFolder(driveClient, name, rootFolderId);
    }

    if (!driveFolderId) {
      throw new Error("Failed to create or find folder");
    }

    const [travel] = await createTravel({
      userId: session.user.id,
      name,
    });

    await updateTravel({
      id: travel.id,
      data: { driveFolderId, isActive: true },
    });

    await setActiveTravel({
      userId: session.user.id,
      travelId: travel.id,
    });

    return NextResponse.json({ travel: { ...travel, driveFolderId } });
  } catch (error) {
    console.error("Error creating travel:", error);
    return NextResponse.json(
      { error: "Failed to create travel" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const updated = await updateTravel({ id, data });

    if (data.isActive) {
      await setActiveTravel({
        userId: session.user.id,
        travelId: id,
      });
    }

    return NextResponse.json({ travel: updated[0] });
  } catch (error) {
    console.error("Error updating travel:", error);
    return NextResponse.json(
      { error: "Failed to update travel" },
      { status: 500 }
    );
  }
}
