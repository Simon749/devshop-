import {
  pgTable, uuid, varchar, text, numeric, boolean, integer, timestamp, pgEnum
} from "drizzle-orm/pg-core";

// ── Enums ──
export const categoryEnum = pgEnum("category", [
  "saas", "ecommerce", "portfolio", "dashboard", "landing"
]);

export const licenseEnum = pgEnum("license_type", ["extended"]);

export const gatewayEnum = pgEnum("payment_gateway", ["mpesa", "paystack"]);

export const statusEnum = pgEnum("payment_status", [
  "pending", "completed", "failed", "expired"
]);

export const sourceEnum = pgEnum("source", [
  "free_download", "newsletter", "purchase"
]);

export const roleEnum = pgEnum("user_role", ["admin", "guest"]);

// ── Templates (product catalog) ──
export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  techStack: text("tech_stack").array().notNull().default([]),
  features: text("features").array().notNull().default([]),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull().default("0.00"),
  priceKes: numeric("price_kes", { precision: 10, scale: 2 }).notNull().default("0.00"),
  licenseType: licenseEnum("license_type").notNull().default("extended"),
  livePreviewUrl: text("live_preview_url"),
  zipFileKey: text("zip_file_key"),           // Uploadthing private key — NEVER sent to client
  // Add these inside the pgTable("templates", { ... }) definition:
  fileFormat: varchar("file_format", { length: 50 }).notNull().default(".zip"), // e.g., ".zip", ".fig"
  fileSizeMb: numeric("file_size_mb", { precision: 6, scale: 2 }).notNull().default("0.00"), // e.g., "24.50"
  version: varchar("version", { length: 20 }).notNull().default("1.0.0"), // e.g., "1.0.0"
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(), // For "Last Updated"
  screenshots: text("screenshots").array().notNull().default([]),
  isPublished: boolean("is_published").notNull().default(false),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Orders (financial ledger) ──
// Immutable once status = 'completed'. checkout_session_id is the idempotency key.
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkoutSessionId: varchar("checkout_session_id", { length: 255 }).notNull().unique(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  paymentGateway: gatewayEnum("payment_gateway").notNull(),
  paymentStatus: statusEnum("payment_status").notNull().default("pending"),
  gatewayRef: varchar("gateway_ref", { length: 255 }),
  gatewayRequestId: varchar("gateway_request_id", { length: 255 }),  // M-Pesa CheckoutRequestID
  downloadToken: uuid("download_token").unique(),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  tokenUsedAt: timestamp("token_used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Subscribers (email list + download history) ──
// Every email that touches the system lands here. Source tells us how they came in.
// This is your marketing goldmine — no auth required.
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  source: sourceEnum("source").notNull(),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
  totalPurchases: integer("total_purchases").notNull().default(0),
  totalDownloads: integer("total_downloads").notNull().default(0),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  isUnsubscribed: boolean("is_unsubscribed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Download History (immutable audit trail) ──
// Every successful download is logged here. Guest can look up by email on /recover.
export const downloadHistory = pgTable("download_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  templateId: uuid("template_id").references(() => templates.id, { onDelete: "set null" }),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  downloadedAt: timestamp("downloaded_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});

// ── Admin Users (DB-level failsafe — Clerk is primary, this is the dead-man's switch) ──
// If someone bypasses middleware, DB RLS + this role enum still blocks them.
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").notNull().default("admin"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Types ──
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type NewSubscriber = typeof subscribers.$inferInsert;
export type DownloadHistory = typeof downloadHistory.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
