# Database Cleanup System

Automated database cleanup system for ChatNow that maintains optimal performance by removing old data.

## Automated Tasks

- **Messages**: Removed after 7 days (daily at 2 AM UTC)
- **Guest Users**: Removed after 24 hours of inactivity (daily at 2 AM UTC)
- **Sessions**: Expired sessions removed hourly
- **Typing Indicators**: Cleaned every 5 minutes
- **Activity Logs**: Old logs removed after 30 days (preserves security logs)

## Configuration

Retention periods are configured in `convex/cleanup.ts`. The system runs automatically via Convex cron jobs with no manual intervention required.

## Implementation

The system uses Convex cron jobs and internal mutations to automatically clean up data. All operations are logged in the `cleanupLogs` table for audit purposes.
