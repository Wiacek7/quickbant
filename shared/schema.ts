import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  coins: integer("coins").default(1000),
  level: integer("level").default(1),
  totalWins: integer("total_wins").default(0),
  totalLosses: integer("total_losses").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table for gaming events/rooms
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  creatorId: varchar("creator_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // poker, chess, tournament, etc
  status: varchar("status", { length: 20 }).default("active"), // active, completed, cancelled
  maxParticipants: integer("max_participants").default(20),
  entryFee: integer("entry_fee").default(0),
  prizePot: integer("prize_pot").default(0),
  settings: jsonb("settings"), // game-specific settings
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("active"), // active, left, kicked
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("message"), // message, system, challenge
  metadata: jsonb("metadata"), // for challenge details, reactions, etc
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenges between users
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  challengerId: varchar("challenger_id").notNull(),
  challengedId: varchar("challenged_id").notNull(),
  eventId: integer("event_id"),
  type: varchar("type", { length: 50 }).notNull(), // chess, poker, quiz, custom
  entryFee: integer("entry_fee").default(0),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, rejected, completed, cancelled
  winnerUserId: varchar("winner_user_id"),
  metadata: jsonb("metadata"), // game-specific details
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // challenge, message, achievement, etc
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  isRead: boolean("is_read").default(false),
  relatedId: integer("related_id"), // related challenge, event, etc
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events, { relationName: "creator" }),
  participatedEvents: many(eventParticipants),
  sentMessages: many(chatMessages),
  sentChallenges: many(challenges, { relationName: "challenger" }),
  receivedChallenges: many(challenges, { relationName: "challenged" }),
  notifications: many(notifications),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  participants: many(eventParticipants),
  messages: many(chatMessages),
  challenges: many(challenges),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventParticipants.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  event: one(events, {
    fields: [chatMessages.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  challenger: one(users, {
    fields: [challenges.challengerId],
    references: [users.id],
    relationName: "challenger",
  }),
  challenged: one(users, {
    fields: [challenges.challengedId],
    references: [users.id],
    relationName: "challenged",
  }),
  event: one(events, {
    fields: [challenges.eventId],
    references: [events.id],
  }),
  winner: one(users, {
    fields: [challenges.winnerUserId],
    references: [users.id],
    relationName: "winner",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;

export type InsertEventParticipant = typeof eventParticipants.$inferInsert;
export type EventParticipant = typeof eventParticipants.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertChallenge = typeof challenges.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

// Zod schemas for validation
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
