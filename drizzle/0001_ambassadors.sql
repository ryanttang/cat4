CREATE TYPE "public"."ambassador_link_mode" AS ENUM('global', 'custom', 'merge');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'ambassador';--> statement-breakpoint
ALTER TYPE "public"."capture_source" ADD VALUE 'ambassador';--> statement-breakpoint
CREATE TABLE "brand_ambassadors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"photo_url" text,
	"bio" text,
	"territory" text,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"user_id" uuid,
	"link_mode" "ambassador_link_mode" DEFAULT 'global' NOT NULL,
	"custom_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hub_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_ambassadors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ambassador_link_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ambassador_id" uuid NOT NULL,
	"link_label" text NOT NULL,
	"link_url" text NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"referrer" text,
	"device_type" "qr_device_type" DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "ambassador_id" uuid;--> statement-breakpoint
ALTER TABLE "brand_ambassadors" ADD CONSTRAINT "brand_ambassadors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ambassador_link_clicks" ADD CONSTRAINT "ambassador_link_clicks_ambassador_id_brand_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."brand_ambassadors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_ambassador_id_brand_ambassadors_id_fk" FOREIGN KEY ("ambassador_id") REFERENCES "public"."brand_ambassadors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "brand_ambassadors_user_id_idx" ON "brand_ambassadors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "qr_codes_ambassador_id_idx" ON "qr_codes" USING btree ("ambassador_id");
