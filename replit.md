# EventChat - Real-time Gaming & Challenge Platform

## Overview

EventChat is a real-time gaming and social platform that combines Discord-style chat with competitive gaming features. The application allows users to create events, participate in challenges, engage in real-time chat, and build a gaming community with leaderboards and achievements.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket implementation for live chat and notifications
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: express-session with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definition between client and server
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- Integration with Replit Auth using OpenID Connect
- Session-based authentication with PostgreSQL session store
- User profile management with coins, levels, and statistics
- Protected routes and API endpoints

### Event System
- Core social/competitive activities (poker, chess, tournaments)
- Event creation, joining, and participation management
- Event status tracking (active, completed, cancelled)
- Participant management and event metadata

### Real-time Chat
- WebSocket-based messaging for instant communication
- Event-specific chat rooms
- Typing indicators and user presence
- Message history with pagination

### Challenge System
- User-to-user challenges with entry fees
- Challenge status management (pending, accepted, rejected)
- Winner determination and coin distribution
- Integration with event system

### Notification System
- Real-time notifications for challenges and events
- Notification count tracking in header
- Toast notifications for user feedback

### UI/UX Features
- Responsive design with mobile-first approach
- Dark/light theme support with system preference detection
- Component library based on Radix UI primitives
- Accessible design patterns

## Data Flow

### User Registration/Login Flow
1. User clicks login → redirected to Replit Auth
2. After authentication, user data is stored/updated in database
3. Session is established with PostgreSQL session store
4. User is redirected to main application

### Event Participation Flow
1. User browses available events
2. User joins event → participation record created
3. WebSocket connection established for event chat
4. Real-time updates for messages and participants

### Challenge Flow
1. User creates challenge for another user
2. Challenge notification sent to target user
3. Target user accepts/rejects challenge
4. Event created if challenge accepted
5. Winner determined and coins distributed

### Real-time Communication Flow
1. WebSocket connection on event join
2. Message broadcast to all event participants
3. Typing indicators and presence updates
4. Automatic reconnection handling

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL driver
- Radix UI component primitives

### Authentication & Session
- Replit Auth OpenID Connect integration
- express-session with connect-pg-simple
- Passport.js for authentication strategies

### Database & Storage
- @neondatabase/serverless for PostgreSQL connection
- Drizzle Kit for migrations and schema management
- WebSocket library for real-time features

### UI & Styling
- Tailwind CSS for styling
- shadcn/ui component library
- Lucide React for icons
- class-variance-authority for component variants

### Development Tools
- Vite for development server and building
- TypeScript for type safety
- ESBuild for server bundling
- PostCSS and Autoprefixer

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- TSX for running TypeScript server with hot reload
- Development-specific middleware and error handling
- Replit integration with development banner

### Production Build
1. Frontend built with Vite to `dist/public`
2. Server bundled with ESBuild to `dist/index.js`
3. Database migrations applied via Drizzle Kit
4. Environment variables configured for production

### Environment Configuration
- Database URL for PostgreSQL connection
- Session secret for authentication
- Replit-specific environment variables
- Production/development mode switching

### Scaling Considerations
- Serverless PostgreSQL connection pooling
- WebSocket connection management
- Session store scaling with PostgreSQL
- Static asset serving optimization

## Changelog

```
Changelog:
- June 29, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```