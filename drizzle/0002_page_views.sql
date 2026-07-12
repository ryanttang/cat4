CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"referrer" text,
	"device_type" "qr_device_type" DEFAULT 'unknown' NOT NULL,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"session_id" text,
	"metadata" jsonb
);
