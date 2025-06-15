import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// Schedule cleanup tasks to run automatically
const crons = cronJobs();

// Run full cleanup daily at 2 AM UTC
crons.daily(
  "daily-cleanup",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cleanup.runFullCleanupInternal,
  { dryRun: false }
);

// Run typing indicators cleanup every 5 minutes (they expire quickly)
crons.interval(
  "typing-indicators-cleanup",
  { minutes: 5 },
  internal.cleanup.cleanupTypingIndicatorsInternal,
  { dryRun: false }
);

// Run session cleanup every hour
crons.hourly(
  "session-cleanup",
  { minuteUTC: 0 },
  internal.cleanup.cleanupExpiredSessionsInternal,
  { dryRun: false }
);

export default crons;
