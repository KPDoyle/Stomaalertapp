import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  owner: text("owner").primaryKey(),
  firstName: text("first_name").notNull(),
  email: text("email").notNull(),
  stomaType: text("stoma_type").notNull(),
  duration: text("duration").notNull(),
  dateCreated: text("date_created").notNull(),
  nurse: text("nurse").notNull(),
  supplier: text("supplier").notNull(),
  products: text("products").notNull(),
  learning: text("learning").notNull(),
  homeSubtitle: text("home_subtitle").notNull(),
  checkinHeading: text("checkin_heading").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const checkins = sqliteTable("checkins", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  output: integer("output").notNull(),
  skin: integer("skin").notNull(),
  comfort: integer("comfort").notNull(),
  mood: integer("mood").notNull(),
  createdAt: text("created_at").notNull(),
});

export const diaryEntries = sqliteTable("diary_entries", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  fileKey: text("file_key"),
  fileName: text("file_name"),
  createdAt: text("created_at").notNull(),
});

export const supplyRequests = sqliteTable("supply_requests", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  supplier: text("supplier").notNull(),
  product: text("product").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  sender: text("sender").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});
