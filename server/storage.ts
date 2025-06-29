import {
  users,
  events,
  eventParticipants,
  chatMessages,
  challenges,
  notifications,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventParticipant,
  type InsertEventParticipant,
  type ChatMessage,
  type InsertChatMessage,
  type Challenge,
  type InsertChallenge,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserCoins(userId: string, amount: number): Promise<void>;

  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventWithParticipants(id: number): Promise<any>;
  getUserEvents(userId: string): Promise<Event[]>;
  getAllActiveEvents(): Promise<Event[]>;

  // Event participation
  joinEvent(participation: InsertEventParticipant): Promise<EventParticipant>;
  leaveEvent(eventId: number, userId: string): Promise<void>;
  getEventParticipants(eventId: number): Promise<any[]>;
  getUserEventParticipation(eventId: number, userId: string): Promise<EventParticipant | undefined>;

  // Chat operations
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getEventMessages(eventId: number, limit?: number): Promise<any[]>;

  // Challenge operations
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallengeStatus(id: number, status: string, winnerUserId?: string): Promise<Challenge>;
  getUserChallenges(userId: string): Promise<any[]>;
  getPendingChallenges(userId: string): Promise<Challenge[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

    // Additions for reactions
  getMessage(messageId: number): Promise<ChatMessage | null>;
  updateMessageMetadata(messageId: number, metadata: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserCoins(userId: string, coins: number): Promise<void> {
    await db.update(users).set({ coins }).where(eq(users.id, userId));
  }

  async getMessage(messageId: number) {
    const result = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, messageId))
      .limit(1);

    return result[0] || null;
  }

  async updateMessageMetadata(messageId: number, metadata: any): Promise<void> {
    await db
      .update(chatMessages)
      .set({ metadata })
      .where(eq(chatMessages.id, messageId));
  }

  // Event operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventWithParticipants(id: number): Promise<any> {
    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        creator: true,
        participants: {
          with: {
            user: true,
          },
        },
      },
    });
    return event;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    const userEvents = await db.query.eventParticipants.findMany({
      where: eq(eventParticipants.userId, userId),
      with: {
        event: true,
      },
    });
    return userEvents.map(ep => ep.event);
  }

  async getAllActiveEvents(): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.status, "active")).orderBy(desc(events.updatedAt));
  }

  // Event participation
  async joinEvent(participation: InsertEventParticipant): Promise<EventParticipant> {
    const [newParticipation] = await db.insert(eventParticipants).values(participation).returning();
    return newParticipation;
  }

  async leaveEvent(eventId: number, userId: string): Promise<void> {
    await db
      .update(eventParticipants)
      .set({ status: "left" })
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)));
  }

  async getEventParticipants(eventId: number): Promise<any[]> {
    const participants = await db.query.eventParticipants.findMany({
      where: and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.status, "active")),
      with: {
        user: true,
      },
    });
    return participants;
  }

  async getUserEventParticipation(eventId: number, userId: string): Promise<EventParticipant | undefined> {
    const [participation] = await db
      .select()
      .from(eventParticipants)
      .where(and(eq(eventParticipants.eventId, eventId), eq(eventParticipants.userId, userId)));
    return participation;
  }

  // Chat operations
  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async getEventMessages(eventId: number, limit: number = 100): Promise<any[]> {
    const messages = await db.query.chatMessages.findMany({
      where: eq(chatMessages.eventId, eventId),
      with: {
        user: true,
      },
      orderBy: desc(chatMessages.createdAt),
      limit,
    });
    return messages.reverse(); // Return in chronological order
  }

  // Challenge operations
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [newChallenge] = await db.insert(challenges).values(challenge).returning();
    return newChallenge;
  }

  async updateChallengeStatus(id: number, status: string, winnerUserId?: string): Promise<Challenge> {
    const updateData: any = { status };
    if (winnerUserId) {
      updateData.winnerUserId = winnerUserId;
      updateData.completedAt = new Date();
    }

    const [updatedChallenge] = await db
      .update(challenges)
      .set(updateData)
      .where(eq(challenges.id, id))
      .returning();
    return updatedChallenge;
  }

  async getUserChallenges(userId: string): Promise<any[]> {
    const userChallenges = await db.query.challenges.findMany({
      where: or(eq(challenges.challengerId, userId), eq(challenges.challengedId, userId)),
      with: {
        challenger: true,
        challenged: true,
        event: true,
      },
      orderBy: desc(challenges.createdAt),
    });
    return userChallenges;
  }

  async getPendingChallenges(userId: string): Promise<Challenge[]> {
    return await db
      .select()
      .from(challenges)
      .where(and(eq(challenges.challengedId, userId), eq(challenges.status, "pending")));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.length;
  }
}

export const storage = new DatabaseStorage();