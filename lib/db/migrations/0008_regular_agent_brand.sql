CREATE TABLE IF NOT EXISTS "DriveFile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travelId" uuid NOT NULL,
	"driveFileId" text NOT NULL,
	"name" text NOT NULL,
	"mimeType" varchar(100),
	"webViewLink" text,
	"documentId" uuid,
	"syncStatus" varchar DEFAULT 'pending' NOT NULL,
	"lastSyncedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "DriveFile_driveFileId_unique" UNIQUE("driveFileId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "GoogleAccount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"googleId" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text NOT NULL,
	"tokenExpiresAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "GoogleAccount_googleId_unique" UNIQUE("googleId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Travel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" text NOT NULL,
	"driveFolderId" text,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DriveFile" ADD CONSTRAINT "DriveFile_travelId_Travel_id_fk" FOREIGN KEY ("travelId") REFERENCES "public"."Travel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "GoogleAccount" ADD CONSTRAINT "GoogleAccount_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Travel" ADD CONSTRAINT "Travel_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
