CREATE TABLE IF NOT EXISTS "InngestStatus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jobId" text NOT NULL,
	"jobType" varchar(50) NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"userId" uuid NOT NULL,
	"metadata" jsonb,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "InngestStatus_jobId_unique" UNIQUE("jobId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ParsedDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"driveFileId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"documentType" varchar NOT NULL,
	"parsedData" jsonb NOT NULL,
	"confidence" varchar(10),
	"rawText" text,
	"inngestJobId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "InngestStatus" ADD CONSTRAINT "InngestStatus_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ParsedDocument" ADD CONSTRAINT "ParsedDocument_driveFileId_DriveFile_id_fk" FOREIGN KEY ("driveFileId") REFERENCES "public"."DriveFile"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ParsedDocument" ADD CONSTRAINT "ParsedDocument_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
