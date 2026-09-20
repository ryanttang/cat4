CREATE TABLE "link_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" "content_status" DEFAULT 'draft' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "link_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TYPE "public"."qr_destination_type" ADD VALUE 'links_page';
--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "link_page_id" uuid;
--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_link_page_id_link_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."link_pages"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "qr_codes_link_page_id_idx" ON "qr_codes" USING btree ("link_page_id");
