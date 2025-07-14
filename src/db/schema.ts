import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  uuid, 
  varchar, 
  integer, 
  timestamp, 
  text, 
  index
} from 'drizzle-orm/pg-core';

// Organisation structure table - hierarchical business organisation levels for Gekko
export const organisationStructures = pgTable('organisation_structures', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  level: integer('level').notNull(), // 0=Company, 1=Division, 2=Department, 3=Team
  parentId: uuid('parent_id'), // Will be handled in relations
  path: text('path').notNull(), // Materialised path for efficient queries (e.g., "company/engineering/frontend/react")
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('parent_id_idx').on(table.parentId),
  index('level_idx').on(table.level),
  // Optimised for materialised path queries with LIKE 'path%'
  index('path_prefix_idx').on(table.path),
  // Composite index for common query patterns (level + path for filtered hierarchy queries)
  index('level_path_idx').on(table.level, table.path),
]);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: text('role').notNull(),
  spiritAnimal: text('spirit_animal').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('email_idx').on(table.email),
]);

// User permissions table - many-to-many relationship between users and organisation structures
// Enables downstream access (managers can see subordinates) and multiple permissions per user
export const userPermissions = pgTable('user_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  structureId: uuid('structure_id').references(() => organisationStructures.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('user_id_idx').on(table.userId),
  index('structure_id_idx').on(table.structureId),
  index('user_structure_idx').on(table.userId, table.structureId),
]);

// Relations
export const organisationStructuresRelations = relations(organisationStructures, ({ one, many }) => ({
  parent: one(organisationStructures, {
    fields: [organisationStructures.parentId],
    references: [organisationStructures.id],
  }),
  children: many(organisationStructures),
  permissions: many(userPermissions),
}));

export const usersRelations = relations(users, ({ many }) => ({
  permissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  structure: one(organisationStructures, {
    fields: [userPermissions.structureId],
    references: [organisationStructures.id],
  }),
}));

// Types for TypeScript
export type OrganisationStructure = typeof organisationStructures.$inferSelect;
export type NewOrganisationStructure = typeof organisationStructures.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;
export type NewUserPermission = typeof userPermissions.$inferInsert; 