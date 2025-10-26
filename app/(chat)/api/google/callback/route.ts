import { google } from "googleapis";
import { NextResponse } from "next/server";
import {
  findOrCreateUser,
  getGoogleAccount,
  saveGoogleAccount,
} from "@/lib/db/queries";
import { initializeDriveClient } from "@/lib/google/drive-service";
import { ensureRootFolder } from "@/lib/google/folder-manager";
import { encryptToken } from "@/lib/google/token-manager";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/drive?error=access_denied", request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/drive?error=missing_params", request.url)
    );
  }

  try {
    // Build redirect URI from request
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const redirectUri = `${protocol}://${host}/api/google/callback`;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.redirect(
        new URL("/drive?error=no_tokens", request.url)
      );
    }

    const decryptedAccessToken = tokens.access_token;
    const decryptedRefreshToken = tokens.refresh_token;

    if (!tokens.id_token) {
      return NextResponse.redirect(
        new URL("/drive?error=no_id_token", request.url)
      );
    }

    const userInfo = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
    });

    const googleId = userInfo.getUserId() || "";
    const email = userInfo.getPayload()?.email || "";

    // Find or create user based on email (for future reference)
    const _dbUser = await findOrCreateUser(email);

    const encryptedAccessToken = encryptToken(decryptedAccessToken);
    const encryptedRefreshToken = encryptToken(decryptedRefreshToken);

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : undefined;

    // Save Google account linked to the NextAuth session user (state parameter)
    // This ensures the status API can find the account using the session user ID
    await saveGoogleAccount({
      userId: state, // Use the NextAuth session user ID from state
      googleId,
      email,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt,
    });

    // Initialize Drive client and ensure root folder exists
    // Note: Google Drive API must be enabled in Google Cloud Console for this to work
    const driveClient = initializeDriveClient(decryptedAccessToken);
    await ensureRootFolder(driveClient);

    const savedAccount = await getGoogleAccount({ userId: state });

    if (savedAccount) {
      return NextResponse.redirect(
        new URL(
          `/drive?success=connected&email=${encodeURIComponent(email)}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL("/drive?error=save_failed", request.url)
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/drive?error=callback_failed", request.url)
    );
  }
}
