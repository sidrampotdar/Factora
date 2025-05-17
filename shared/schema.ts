import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  factory: text("factory").notNull(),
});

// ProductionLine model
export const productionLines = pgTable("production_lines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  product: text("product").notNull(),
  target: integer("target").notNull(),
  completed: integer("completed").notNull().default(0),
  efficiency: doublePrecision("efficiency").notNull().default(0),
  status: text("status").notNull().default("Active"),
  factoryId: text("factory_id").notNull(),
});

// Inventory model
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  material: text("material").notNull(),
  currentStock: doublePrecision("current_stock").notNull(),
  unit: text("unit").notNull(),
  minRequired: doublePrecision("min_required").notNull(),
  status: text("status").notNull(),
  nextDelivery: text("next_delivery"),
  factoryId: text("factory_id").notNull(),
});

// Workforce model
export const workforce = pgTable("workforce", {
  id: serial("id").primaryKey(),
  department: text("department").notNull(),
  total: integer("total").notNull(),
  present: integer("present").notNull(),
  onLeave: integer("on_leave").notNull(),
  absent: integer("absent").notNull(),
  factoryId: text("factory_id").notNull(),
});

// Alerts model
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  time: text("time").notNull(),
  read: boolean("read").notNull().default(false),
  factoryId: text("factory_id").notNull(),
});

// Factory model
export const factories = pgTable("factories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  location: text("location").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
  factory: true,
});

export const insertProductionLineSchema = createInsertSchema(productionLines).pick({
  name: true,
  product: true,
  target: true,
  completed: true,
  efficiency: true,
  status: true,
  factoryId: true,
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  material: true,
  currentStock: true,
  unit: true,
  minRequired: true,
  status: true,
  nextDelivery: true,
  factoryId: true,
});

export const insertWorkforceSchema = createInsertSchema(workforce).pick({
  department: true,
  total: true,
  present: true,
  onLeave: true,
  absent: true,
  factoryId: true,
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  type: true,
  title: true,
  message: true,
  time: true,
  read: true,
  factoryId: true,
});

export const insertFactorySchema = createInsertSchema(factories).pick({
  name: true,
  location: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProductionLine = z.infer<typeof insertProductionLineSchema>;
export type ProductionLine = typeof productionLines.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertWorkforce = z.infer<typeof insertWorkforceSchema>;
export type Workforce = typeof workforce.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertFactory = z.infer<typeof insertFactorySchema>;
export type Factory = typeof factories.$inferSelect;

// Dashboard metrics type
export type DashboardMetrics = {
  productionEfficiency: number;
  activeLines: string;
  todaysOutput: number;
  attendance: string;
  attendanceRate: number;
};
