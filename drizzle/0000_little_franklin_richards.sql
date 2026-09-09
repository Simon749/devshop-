CREATE TYPE "public"."category" AS ENUM('saas', 'ecommerce', 'portfolio', 'dashboard', 'landing');--> statement-breakpoint
CREATE TYPE "public"."payment_gateway" AS ENUM('mpesa', 'paystack');--> statement-breakpoint
CREATE TYPE "public"."license_type" AS ENUM('extended');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'guest');--> statement-breakpoint
CREATE TYPE "public"."source" AS ENUM('free_download', 'newsletter', 'purchase');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'admin' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "download_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"template_id" uuid,
	"customer_email" varchar(255) NOT NULL,
	"downloaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkout_session_id" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"template_id" uuid,
	"amount_paid" numeric(10, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"payment_gateway" "payment_gateway" NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"gateway_ref" varchar(255),
	"gateway_request_id" varchar(255),
	"download_token" uuid,
	"token_expires_at" timestamp with time zone,
	"token_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_checkout_session_id_unique" UNIQUE("checkout_session_id"),
	CONSTRAINT "orders_download_token_unique" UNIQUE("download_token")
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"source" "source" NOT NULL,
	"template_id" uuid,
	"total_purchases" integer DEFAULT 0 NOT NULL,
	"total_downloads" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone,
	"is_unsubscribed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"category" "category" NOT NULL,
	"tech_stack" text[] DEFAULT '{}' NOT NULL,
	"features" text[] DEFAULT '{}' NOT NULL,
	"price_usd" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"price_kes" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"license_type" "license_type" DEFAULT 'extended' NOT NULL,
	"live_preview_url" text,
	"zip_file_key" text,
	"file_format" varchar(50) DEFAULT '.zip' NOT NULL,
	"file_size_mb" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"version" varchar(20) DEFAULT '1.0.0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"screenshots" text[] DEFAULT '{}' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "download_history" ADD CONSTRAINT "download_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "download_history" ADD CONSTRAINT "download_history_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;