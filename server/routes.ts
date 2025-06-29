import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertChatMessageSchema, insertChallengeSchema } from "@shared/schema";
import { z } from "zod";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: "2015215",
  key: "1815375eec67f627d132",
  secret: "db0468127736c8a935b8",
  cluster: "mt1",
  useTLS: true
});

interface ExtendedWebSocket extends WebSocket {
  userId?: string;
  eventId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getAllActiveEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEventWithParticipants(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEventSchema.parse({
        ...req.body,
        creatorId: userId,
      });

      const event = await storage.createEvent(validatedData);

      // Auto-join creator to the event
      await storage.joinEvent({
        eventId: event.id,
        userId: userId,
      });

      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post('/api/events/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);

      // Check if user is already participating
      const existing = await storage.getUserEventParticipation(eventId, userId);
      if (existing && existing.status === 'active') {
        return res.status(400).json({ message: "Already participating in this event" });
      }

      const participation = await storage.joinEvent({
        eventId,
        userId,
      });

      res.json(participation);
    } catch (error) {
      console.error("Error joining event:", error);
      res.status(500).json({ message: "Failed to join event" });
    }
  });

  app.post('/api/events/:id/leave', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.id);

      await storage.leaveEvent(eventId, userId);
      res.json({ message: "Left event successfully" });
    } catch (error) {
      console.error("Error leaving event:", error);
      res.status(500).json({ message: "Failed to leave event" });
    }
  });

  // Chat routes
  app.get('/api/events/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 100;
      const messages = await storage.getEventMessages(eventId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/events/:eventId/messages/:messageId/react', isAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.messageId);
      const { emoji } = req.body;
      const userId = req.user.claims.sub;

      if (!emoji) {
        return res.status(400).json({ message: "Emoji is required" });
      }

      // For now, we'll just return success. In a real app, you'd store reactions in the database
      // and update the message metadata
      res.json({ success: true, emoji, messageId });
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(500).json({ message: "Failed to add reaction" });
    }
  });

  app.post('/api/events/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content, type = 'message', metadata } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      const validatedData = insertChatMessageSchema.parse({
        eventId,
        userId,
        content: content.trim(),
        type,
        metadata,
      });

      const message = await storage.createMessage(validatedData);

      // Broadcast via Pusher
      const user = await storage.getUser(userId);
      await pusher.trigger(`event-${eventId}`, 'new_message', {
        message: {
          ...message,
          user: {
            id: userId,
            firstName: req.user.claims.first_name,
            profileImageUrl: req.user.claims.profile_image_url,
          },
        },
      });

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Challenge routes
  app.get('/api/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenges = await storage.getUserChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get('/api/challenges/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challenges = await storage.getPendingChallenges(userId);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching pending challenges:", error);
      res.status(500).json({ message: "Failed to fetch pending challenges" });
    }
  });

  app.post('/api/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChallengeSchema.parse({
        ...req.body,
        challengerId: userId,
      });

      const challenge = await storage.createChallenge(validatedData);

      // Create notification for challenged user
      await storage.createNotification({
        userId: challenge.challengedId,
        type: 'challenge',
        title: 'New Challenge!',
        content: `You have been challenged to a ${challenge.type} match`,
        relatedId: challenge.id,
      });

      res.json(challenge);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid challenge data", errors: error.errors });
      }
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  app.patch('/api/challenges/:id', isAuthenticated, async (req: any, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const { status, winnerUserId } = req.body;

      const challenge = await storage.updateChallengeStatus(challengeId, status, winnerUserId);

      // Create notifications based on status change
      if (status === 'accepted') {
        await storage.createNotification({
          userId: challenge.challengerId,
          type: 'challenge',
          title: 'Challenge Accepted!',
          content: 'Your challenge has been accepted',
          relatedId: challengeId,
        });
      } else if (status === 'completed' && winnerUserId) {
        // Update user coins based on winner
        const user = await storage.getUser(winnerUserId);
        if (user) {
          const entryFee = challenge.entryFee || 0;
          await storage.updateUserCoins(winnerUserId, (user.coins || 0) + entryFee * 2);
        }

        await storage.createNotification({
          userId: winnerUserId,
          type: 'challenge',
          title: 'Challenge Won!',
          content: `You won ${(challenge.entryFee || 0) * 2} coins`,
          relatedId: challengeId,
        });
      }

      res.json(challenge);
    } catch (error) {
      console.error("Error updating challenge:", error);
      res.status(500).json({ message: "Failed to update challenge" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Pusher trigger endpoint
  app.post("/api/pusher/trigger", isAuthenticated, async (req: any, res) => {
    try {
      const { channel, event, data } = req.body;

      await pusher.trigger(channel, event, data);
      res.json({ success: true });
    } catch (error) {
      console.error('Pusher trigger error:', error);
      res.status(500).json({ message: "Failed to trigger Pusher event" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}