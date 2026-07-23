# ChatPulse

ChatPulse is a real-time social messaging platform built for fast, privacy-conscious conversations. It combines direct messaging, temporary guest access, community groups, presence-aware discovery, moderation workflows, and an SEO-ready publishing layer in one Next.js and Convex application.

The product is centered on low-friction connection: users can create a permanent account, enter through a 24-hour guest session, discover active people, start private conversations, or join role-managed groups without a heavy onboarding process.

## Preview

Current product screenshots from the `public/` folder.

### Guest Authentication

![Guest authentication page](public/Screenshot%202026-07-23%20at%203.27.25%E2%80%AFPM.png)

### Direct Messaging

![Realtime direct chat interface](public/Screenshot%202026-07-23%20at%203.24.05%E2%80%AFPM.png)

### Group Conversations

![Group conversation with mentions](public/Screenshot%202026-07-23%20at%203.25.50%E2%80%AFPM.png)

### Group Creation

![Create new group dialog](public/Screenshot%202026-07-23%20at%203.25.00%E2%80%AFPM.png)

### Member Invitations

![Invite members dialog](public/Screenshot%202026-07-23%20at%203.25.14%E2%80%AFPM.png)

## What It Does

ChatPulse is more than a basic chat UI. The app includes a realtime backend, session management, discovery rules, group governance, support pages, and content publishing.

| Area | Capabilities |
| --- | --- |
| Authentication | Registered accounts, username/email login, guest mode, guest upgrade flow, session persistence |
| Direct chat | One-to-one conversations, realtime messages, replies, typing indicators, read receipts, file metadata |
| Presence | Online/recent/away/offline state, heartbeat tracking, activity-based ranking, privacy-aware display |
| Discovery | Smart user visibility based on activity, unread state, online status, and location-aware metadata |
| Groups | Official groups, community groups, public/private access, join requests, invitations, member limits |
| Moderation | Blocking, reporting, bans, member removal, denial reasons, activity logs, role-based controls |
| Content | Convex-backed blog posts, rich content blocks, featured posts, categories, tags, SEO metadata |
| Operations | Cron cleanup for sessions, typing indicators, guest data, inactive groups, and audit logging |

## Feature Highlights

### Realtime Messaging

- Direct conversations between users
- Group conversations backed by the same message system
- Typing indicators with automatic expiration
- Read receipts for direct and group messages
- Reply previews for threaded context
- Text, image, file, and system message types
- Message metadata for attachments, filenames, MIME types, and file sizes

### Guest-First Access

- No email required for guest entry
- Guest usernames are automatically prefixed with `Guest_`
- Guest sessions expire after 24 hours
- Guests can participate quickly while registered users keep persistent identity
- Account upgrade flow is wired through the auth context

### Smart Presence System

- Tracks meaningful activity separately from background heartbeats
- Uses online, recently active, away, and offline internal states
- Keeps user lists cleaner by prioritizing people who are actually active
- Avoids moving users around for passive events such as tab changes
- Includes user privacy settings for status visibility

### Group Governance

- Official app-managed groups and user-created community groups
- One-community-group-per-user restriction
- Public groups with direct join support
- Private groups with approval flows
- Invitations by user, username, email, or invite code
- Creator, admin, moderator, and member roles
- Member removal, bans, leave flow, settings, join request review, and activity logging

### Safety And Trust

- User blocking relationships
- Reports for users, messages, and groups
- Ban reasons and optional ban expiry timestamps
- Soft-delete and archive states for accounts and groups
- Cleanup logs for operational visibility

### Blog And SEO

- Rich content blocks for headings, paragraphs, code, images, quotes, and lists
- Cover images and alt text
- Meta descriptions, keywords, canonical URLs, Open Graph fields, and Twitter card fields
- Featured posts, categories, tags, authors, read time, and view counts
- Dedicated blog index and article detail routes

## Tech Stack

- **Next.js App Router** for routing, layouts, and page composition
- **React 19** for UI rendering
- **TypeScript** across frontend and Convex backend code
- **Convex** for realtime queries, mutations, schema, generated API bindings, and cron jobs
- **Tailwind CSS 4** for styling
- **Radix UI** primitives and local UI components for dialogs, sheets, menus, forms, tabs, drawers, and controls
- **React Hook Form** and **Zod** for validated auth and input flows
- **Lucide React** for icons
- **Sonner** for toast notifications
- **next-themes** for theme switching

## Architecture

```text
Browser
  |
  | React components, hooks, auth context, Convex client
  v
Next.js App Router
  |
  | Pages, layouts, protected surfaces, UI shells
  v
Convex Backend
  |
  | Queries, mutations, database tables, indexes, cron cleanup
  v
Convex Database
```

The frontend reads and writes realtime state through the generated Convex API in `convex/_generated`. Authentication is handled by the local auth context, which stores a session token client-side and validates it through Convex queries and mutations.

## Project Structure

```text
app/
  auth/                 Sign in, sign up, forgot password, and guest entry routes
  chat/                 Direct chat shell and conversation pages
  groups/               Group shell, group list, invitation page, and group conversation routes
  blog/                 Blog index and article detail pages
  support/              Support and contact page
  about/ privacy/ terms/ Static product and policy pages

components/
  auth/                 Auth layouts and password strength UI
  blog/                 Article rendering, sharing, progress, related posts, skeletons
  chat/                 App shell, sidebar, user list, message area, input, attachments
  groups/               Group list, access handling, settings, members, invitations, requests
  providers/            Convex, theme, and app-level providers
  settings/             Registered and guest settings surfaces
  ui/                   Reusable component primitives

convex/
  schema.ts             Database tables and indexes
  auth.ts               Account, guest, session, and upgrade mutations
  chat.ts               Conversation, messages, typing, reads, blocking/reporting logic
  groups.ts             Group creation, membership, invitations, roles, and access control
  blog.ts               Blog content queries and seed/content helpers
  cleanup.ts            Data cleanup tasks
  scheduler.ts          Cron schedules

lib/
  contexts/             Auth context
  hooks/                Online status, unread counts, invitations
  types/                Auth, blog, and contact types
  utils/                Auth, chat, SEO, and shared helpers
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page |
| `/auth/signin` | Registered user login |
| `/auth/signup` | New account registration |
| `/auth/forgot-password` | Password recovery screen |
| `/auth/guest` | Temporary guest session entry |
| `/chat` | Chat shell and discoverable user list |
| `/chat/[userId]` | Direct message conversation |
| `/groups` | Group list with official/community tabs |
| `/groups/[groupId]` | Group chat, members, requests, and settings |
| `/groups/invitations` | Incoming group invitations |
| `/profile` | User profile |
| `/settings` | Registered or guest settings |
| `/blog` | Blog index with search and categories |
| `/blog/[slug]` | SEO-ready blog article |
| `/support` | FAQ and support contact surface |
| `/about` | Product/about page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## Data Model

| Table | Purpose |
| --- | --- |
| `users` | Registered and guest identities, privacy settings, presence, bans, profile data |
| `sessions` | Active session tokens, expiry, and activity timestamps |
| `conversations` | Direct and group conversation records |
| `messages` | Message content, attachment metadata, read receipts, replies, mentions |
| `groups` | Official and community group configuration |
| `groupMemberships` | Role, status, invite, ban, removal, and read state per group member |
| `groupInvitations` | Pending and historical group invitations |
| `groupActivityLogs` | Audit trail for group lifecycle and moderation actions |
| `groupMessageReads` | Scalable read tracking for group messages |
| `typingIndicators` | Expiring typing activity records |
| `blocks` | User block relationships |
| `reports` | User, message, and group reports |
| `contactSubmissions` | Support/contact form submissions |
| `blogPosts` | Rich article content and SEO metadata |
| `cleanupLogs` | Cleanup job results and operational history |

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Convex account/project

### Install

```bash
npm install
```

### Environment

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`NEXT_PUBLIC_CONVEX_URL` is required. `NEXT_PUBLIC_BASE_URL` is used by SEO helpers and should point to the deployed site in production.

### Start Convex

```bash
npx convex dev
```

The Convex CLI will connect the local app to a Convex deployment and keep generated API files updated in `convex/_generated`.

### Start Next.js

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run the configured lint command |
| `npx convex dev` | Start Convex in development mode |
| `npx convex deploy` | Deploy Convex functions and schema |

## Convex Automation

Scheduled jobs are defined in `convex/scheduler.ts`.

| Job | Schedule | Purpose |
| --- | --- | --- |
| `daily-cleanup` | Daily at 2:00 UTC | Full cleanup pass |
| `typing-indicators-cleanup` | Every 5 minutes | Remove expired typing indicators |
| `session-cleanup` | Hourly | Remove expired sessions |

## Configuration Notes

- The Convex client is initialized in `components/providers/convex-provider.tsx`.
- Auth state is managed in `lib/contexts/auth-context.tsx`.
- Session token persistence helpers live in `lib/utils/auth.ts`.
- SEO defaults live in `lib/seo-utils.ts`.
- Online status behavior is documented in `docs/online-status-system.md`.
- Hybrid discovery behavior is documented in `docs/hybrid-smart-user-discovery.md`.

## Image Placeholder Guide

The README currently uses the five screenshots in `public/`. For cleaner long-term paths, you can rename or add final images under a stable folder such as `public/readme/`:

```text
public/readme/
  guest-auth.png
  chat-interface.png
  group-conversation.png
  create-group.png
  invite-members.png
```

Then update the preview image paths:

```md
![Guest authentication page](public/readme/guest-auth.png)
```

For direct hosted images, use the final image URL:

```md
![ChatPulse landing page](https://example.com/chatpulse-landing.png)
```

## Deployment

1. Configure the production Convex deployment.
2. Set `NEXT_PUBLIC_CONVEX_URL` to the production Convex URL.
3. Set `NEXT_PUBLIC_BASE_URL` to the production site URL.
4. Build the app.

```bash
npm run build
```

5. Deploy the frontend to Vercel or another Next.js-compatible host.
6. Deploy Convex functions and schema.

```bash
npx convex deploy
```

## Production Hardening

The current app includes a complete demo-ready auth flow, but production should harden the following areas:

- Replace simplified password hashing with bcrypt, Argon2, or a managed auth provider
- Generate cryptographically secure session tokens
- Add rate limiting to auth, guest creation, messaging, support, and reporting endpoints
- Move attachment uploads to a dedicated storage provider if large files are expected
- Add moderation workflows for report review and enforcement
- Add automated tests around auth, group permissions, cleanup jobs, and messaging behavior

## Documentation

- `PRODUCT_ANALYSIS.md`
- `docs/online-status-system.md`
- `docs/hybrid-smart-user-discovery.md`

## License

This project is currently private. Add license details here before publishing the repository publicly.
