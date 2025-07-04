CREATE TABLE "organisation_structures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" integer NOT NULL,
	"parent_id" uuid,
	"path" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"structure_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"spirit_animal" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_structure_id_organisation_structures_id_fk" FOREIGN KEY ("structure_id") REFERENCES "public"."organisation_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parent_id_idx" ON "organisation_structures" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "level_idx" ON "organisation_structures" USING btree ("level");--> statement-breakpoint
CREATE INDEX "path_idx" ON "organisation_structures" USING btree ("path");--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "user_permissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "structure_id_idx" ON "user_permissions" USING btree ("structure_id");--> statement-breakpoint
CREATE INDEX "user_structure_idx" ON "user_permissions" USING btree ("user_id","structure_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");