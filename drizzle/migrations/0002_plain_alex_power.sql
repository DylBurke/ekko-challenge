ALTER TABLE "user_permissions" ADD COLUMN "inherited_from" uuid;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD COLUMN "is_direct_assignment" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_inherited_from_organisation_structures_id_fk" FOREIGN KEY ("inherited_from") REFERENCES "public"."organisation_structures"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inherited_from_idx" ON "user_permissions" USING btree ("inherited_from");--> statement-breakpoint
CREATE INDEX "user_direct_idx" ON "user_permissions" USING btree ("user_id","is_direct_assignment");