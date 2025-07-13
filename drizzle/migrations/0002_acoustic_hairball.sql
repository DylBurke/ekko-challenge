ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_inherited_from_organisation_structures_id_fk";
--> statement-breakpoint
DROP INDEX "path_idx";--> statement-breakpoint
DROP INDEX "inherited_from_idx";--> statement-breakpoint
DROP INDEX "user_direct_idx";--> statement-breakpoint
CREATE INDEX "path_prefix_idx" ON "organisation_structures" USING btree ("path");--> statement-breakpoint
CREATE INDEX "level_path_idx" ON "organisation_structures" USING btree ("level","path");--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN "inherited_from";--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN "is_direct_assignment";