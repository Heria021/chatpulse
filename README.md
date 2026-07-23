# ChatPulse

ChatPulse is a privacy-first real-time chat platform built with Next.js and Convex. It supports registered accounts, temporary guest access, direct messaging, group conversations, online presence, typing indicators, read receipts, support pages, and an SEO-ready blog.

The app is designed around quick connection without losing safety controls: guests can enter with minimal details, registered users can keep persistent accounts, and group spaces include roles, approvals, invitations, reporting, blocking, and cleanup automation.

## Screenshots

Replace these placeholder paths with the final image files when screenshots are ready.

![ChatPulse landing page](docs/images/landing-page-placeholder.png)

![Direct chat interface](docs/images/direct-chat-placeholder.png)

![Groups dashboard](docs/images/groups-dashboard-placeholder.png)

![Guest mode screen](docs/images/guest-mode-placeholder.png)

![Blog page](docs/images/blog-page-placeholder.png)

## Features

- Account sign up and sign in with username or email
- Guest mode with generated `Guest_` usernames and 24-hour guest expiry
- Direct one-to-one conversations
- Group chat with official and community groups
- Public and private group access flows
- Group roles: creator, admin, moderator, and member
- Group invitations, join requests, member removal, bans, and role management
- Real-time messages, typing indicators, read receipts, replies, and file metadata
- User discovery and online status tracking based on meaningful activity
- User blocking and reporting support
- Profile and settings pages for account preferences
- SEO-focused blog with rich content blocks, featured posts, tags, and categories
- Contact/support page and policy pages
- Scheduled Convex cleanup for expired sessions, typing indicators, guests, and inactive data
- Light/dark theme support through `next-themes`

## Tech Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Frontend:** React, Tailwind CSS, Radix UI primitives, shadcn-style components
- **Realtime backend:** Convex
- **Forms and validation:** React Hook Form, Zod
- **UI helpers:** Lucide React icons, Sonner toasts, Motion
- **Content:** Convex-backed blog content with SEO metadata

## Project Structure

```text
app/                    Next.js routes and page layouts
components/             Reusable UI, auth, chat, group, blog, and settings components
convex/                 Convex schema, queries, mutations, cron jobs, and generated API bindings
hooks/                  Shared React hooks
lib/                    App utilities, types, contexts, SEO helpers, and data helpers
docs/                   Technical documentation
public/                 Static public assets
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketing/product landing page |
| `/auth/signin` | Registered user login |
| `/auth/signup` | New account registration |
| `/auth/guest` | Temporary guest access |
| `/chat` | Chat shell and user list |
| `/chat/[userId]` | Direct message conversation |
| `/groups` | Group list and group navigation |
| `/groups/[groupId]` | Group conversation view |
| `/groups/invitations` | User group invitations |
| `/profile` | User profile |
| `/settings` | User or guest settings |
| `/blog` | Blog index |
| `/blog/[slug]` | Blog article page |
| `/support` | Support and contact page |
| `/about` | About page |
| `/privacy` | Privacy policy |
| `/terms` | Terms page |

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A Convex project

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`NEXT_PUBLIC_CONVEX_URL` is required by the Convex React client. `NEXT_PUBLIC_BASE_URL` is used by SEO helpers and can be changed for production.

### Run Convex

In one terminal, start Convex development:

```bash
npx convex dev
```

Follow the Convex CLI prompts to connect or create a deployment. Convex will keep generated files in `convex/_generated`.

### Run the Next.js app

In another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev      # Start the local Next.js development server
npm run build    # Build the production app
npm run start    # Start the production server after building
npm run lint     # Run the configured lint script
```

## Backend Overview

Convex stores the core application data:

- `users`: registered users and guest users
- `sessions`: active login and guest sessions
- `conversations`: direct and group conversation records
- `messages`: text, image, file, and system messages
- `groups`: official and user-created groups
- `groupMemberships`: roles, membership state, bans, removals, and read state
- `groupInvitations`: pending, accepted, declined, expired, and cancelled invites
- `groupActivityLogs`: group moderation and lifecycle history
- `typingIndicators`: short-lived typing state
- `blocks`: user block relationships
- `reports`: user, message, and group reports
- `contactSubmissions`: support/contact form records
- `blogPosts`: rich blog content and SEO metadata
- `cleanupLogs`: cleanup job audit history

Scheduled jobs are defined in `convex/scheduler.ts`:

- Daily full cleanup at 2:00 UTC
- Typing indicator cleanup every 5 minutes
- Expired session cleanup every hour

## Product Notes

ChatPulse tracks presence through meaningful actions such as sending, reading, typing, and uploading. Heartbeats keep users available without constantly changing discovery rankings. Guest accounts are temporary and intended for low-friction access, while registered accounts keep longer sessions and persistent profile data.

Group creation is intentionally constrained: users can create one community group, while official groups are app-managed. Private groups can require approval, and group permissions are split across creator, admin, moderator, and member roles.

## Image Placeholder Guide

When final images are available, place them in a folder such as `docs/images/` or `public/readme/`, then update the screenshot paths at the top of this README.

Example:

```md
![ChatPulse landing page](docs/images/landing-page.png)
```

For externally hosted images, replace the path with the direct image URL:

```md
![ChatPulse landing page](https://example.com/chatpulse-landing.png)
```

## Deployment

The frontend can be deployed on Vercel or any Next.js-compatible hosting provider. The Convex deployment must be configured separately, then the production frontend should receive the production `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_BASE_URL` values.

Before deploying:

```bash
npm run build
```

## Documentation

Additional technical notes are available in:

- `docs/online-status-system.md`
- `docs/hybrid-smart-user-discovery.md`
- `PRODUCT_ANALYSIS.md`

## Security Notice

The current auth implementation is suitable for local/demo development, but production deployments should replace the simplified password hashing and token generation with a hardened authentication provider or a stronger server-side implementation.
