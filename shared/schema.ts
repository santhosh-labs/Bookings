import { mysqlTable, varchar, int, boolean, json, text } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workspaces = mysqlTable("workspaces", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: text("logo"),
  currency: varchar("currency", { length: 20 }).notNull().default("USD"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("UTC"),
  ownerId: int("owner_id"),
  theme: json("theme").$type<{
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    backgroundUrl?: string;
    showHeader?: boolean;
    headerTitle?: string;
  }>(),
});

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  createdAt: varchar("created_at", { length: 50 }).notNull(),
});

export const memberships = mysqlTable("memberships", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  workspaceId: int("workspace_id").notNull(),
  role: varchar("role", { length: 50 }).notNull(), // "OWNER" | "STAFF"
  createdAt: varchar("created_at", { length: 50 }).notNull(),
});

export const staff = mysqlTable("staff", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // "Admin" | "Staff"
  avatar: text("avatar"),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  designation: varchar("designation", { length: 255 }),
  gender: varchar("gender", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  additionalInfo: text("additional_info"),
});

export const services = mysqlTable("services", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  duration: int("duration").notNull(),
  price: int("price").notNull(),
  bufferTime: int("buffer_time").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  image: text("image"),
  color: varchar("color", { length: 20 }),
  category: varchar("category", { length: 50 }), // one-on-one, group, collective, resource
  scheduleType: varchar("schedule_type", { length: 50 }), // one-time, recurring
  staffIds: json("staff_ids").notNull(),
  settings: json("settings").$type<{
    scheduling?: {
      bufferBefore?: number;
      bufferAfter?: number;
      minimumNotice?: number;
      timeIncrements?: number;
      dateRange?: string;
      maxBookingsPerDay?: string | number;
    },
    availability?: {
      type?: string;
      range?: number;
      schedule?: any;
    },
    notifications?: {
      emailConfirmation?: boolean;
      reminders?: boolean;
      cancellationPolicy?: boolean;
      reschedulePolicy?: boolean;
    },
    bookingForm?: Array<{
      id?: string;
      label?: string;
      required?: boolean;
      type?: string;
    }>
  }>().notNull(),
});

export const customers = mysqlTable("customers", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  totalBookings: int("total_bookings").default(0),
  lastBooking: varchar("last_booking", { length: 50 }),
  joinedDate: varchar("joined_date", { length: 50 }).notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  serviceId: int("service_id").notNull(),
  staffId: int("staff_id"),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull().default(""),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull().default(""),
  serviceName: varchar("service_name", { length: 255 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'Upcoming', 'Completed', 'Cancelled', 'Pending'
  notes: text("notes"),
});

export const availability = mysqlTable("availability", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id"), // Optional for now
  schedule: json("schedule").notNull(), // weekly schedule configuration
  timezone: varchar("timezone", { length: 50 }).notNull(),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'info', 'success', 'warning', 'booking'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: varchar("created_at", { length: 50 }).notNull(), // Using string for simplicity consistent with other dates
});

// Workflows table
export const workflows = mysqlTable("workflows", {
  id: int("id").primaryKey().autoincrement(),
  workspaceId: int("workspace_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'email', 'sms', 'webhook'
  trigger: varchar("trigger", { length: 50 }).notNull(), // 'after_booking', 'reminder', 'cancellation'
  settings: json("settings").$type<{
    template?: string;
    subject?: string;
    delay?: number; // minutes
    url?: string; // for webhooks
  }>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertMembershipSchema = createInsertSchema(memberships).omit({ id: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true });

export type Workspace = typeof workspaces.$inferSelect;
export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Availability = typeof availability.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Workflow = typeof workflows.$inferSelect;
