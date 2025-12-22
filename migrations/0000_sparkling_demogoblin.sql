CREATE TABLE "assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"current_value" numeric(12, 2) NOT NULL,
	"description" text,
	"is_business" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text NOT NULL,
	"is_business" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"source" text NOT NULL,
	"description" text,
	"is_business" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"quantity" numeric(12, 4) NOT NULL,
	"current_value" numeric(12, 2) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "liabilities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text,
	"is_business" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_fleet" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" text NOT NULL,
	"license_plate" text NOT NULL,
	"purchase_price" numeric(12, 2) NOT NULL,
	"current_value" numeric(12, 2) NOT NULL,
	"daily_rate" numeric(12, 2) NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"notes" text
);
