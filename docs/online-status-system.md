# Real-World Online Status System

## Overview

ChatNow implements a sophisticated, real-world online status system that accurately reflects when users are actively engaged with the application. This system provides meaningful presence information while respecting user privacy and avoiding social judgment.

## Status Levels

### Internal Status Categories
The system tracks four distinct status levels internally:

1. **Online** (0-2 minutes): User is actively using ChatNow
2. **Recently Active** (2-5 minutes): User was recently active but may have stepped away
3. **Away** (5 minutes - 24 hours): User hasn't been active recently
4. **Offline** (24+ hours): User hasn't been seen for an extended period

### User-Facing Display
To avoid social pressure and judgment, users see a simplified two-tier system:

- 🟢 **Online**: Covers both "online" and "recently active" users (0-5 minutes)
- 🔘 **Away/Offline**: Users who haven't been active for 5+ minutes

## Activity Tracking

### Meaningful Activities (Affects Ranking)
These actions update `lastActivity` and influence user list positioning:
- Sending messages
- Reading messages (marking as read)
- Starting to type
- Uploading files

### Maintenance Activities (Status Only)
These actions maintain online status but don't change ranking:
- Heartbeat signals
- Opening conversations
- Tab switching/page navigation

### Activity Detection
- **Heartbeat Interval**: 30 seconds
- **User Interaction Tracking**: Minimum 60-second gaps
- **Visibility Handling**: Pauses when tab is hidden
- **Session Management**: Automatic cleanup of inactive sessions

## User List Behavior

### Users Tab Filtering
Only shows users who have been active within the last 5 minutes:
- More accurate representation of available users
- Reduces "ghost" online users
- Dynamic list that reflects real-time activity

### Sorting Priority
1. **Unread Messages**: Users with new messages appear first
2. **Online Status**: Online users before recently active users
3. **Recent Activity**: Most recently active users first

### Anti-Bouncing Logic
- Tab switches don't trigger ranking changes
- Only meaningful interactions move users to top
- Heartbeats maintain status without affecting position

## Technical Implementation

### Database Schema
```typescript
// Enhanced user fields
lastActivity: v.optional(v.number())     // Last meaningful activity
currentStatus: v.optional(v.union(       // Calculated status
  v.literal("online"),
  v.literal("recently_active"), 
  v.literal("away"),
  v.literal("offline")
))
```

### Status Calculation
```typescript
function calculateUserStatus(lastActivity: number, currentTime: number) {
  const timeSinceActivity = currentTime - lastActivity;
  
  if (timeSinceActivity < 2 * 60 * 1000) return "online";
  if (timeSinceActivity < 5 * 60 * 1000) return "recently_active";
  if (timeSinceActivity < 24 * 60 * 60 * 1000) return "away";
  return "offline";
}
```

### Frontend Integration
- `useOnlineStatus` hook for automatic activity tracking
- Real-time status indicators with animations
- Intelligent activity detection and reporting

## Privacy Features

### User Controls
- `showOnlineStatus` setting allows users to hide their status
- Privacy preferences respected throughout the system
- No exposure of exact activity timing to other users

### Data Protection
- Activity logs for analytics (optional)
- Minimal data collection focused on functionality
- Automatic cleanup of old activity data

## Performance Optimizations

### Efficient Queries
- Indexed database queries for status lookups
- Filtered user lists to reduce data transfer
- Real-time calculations to avoid stale data

### Smart Updates
- Batched status updates to reduce database load
- Intelligent caching of user status information
- Optimized sorting algorithms for large user lists

## Benefits

### User Experience
- **Accurate Presence**: Shows who's truly available
- **Reduced Noise**: Eliminates inactive "online" users
- **Privacy Friendly**: No social pressure from status visibility
- **Real-time Updates**: Dynamic user list reflects current activity

### Technical Advantages
- **Scalable Architecture**: Efficient handling of large user bases
- **Reliable Status**: Activity-based detection prevents false positives
- **Flexible System**: Easy to adjust thresholds and behaviors
- **Production Ready**: Handles edge cases and error conditions

## Configuration

### Adjustable Thresholds
```typescript
const ONLINE_THRESHOLD = 2 * 60 * 1000;        // 2 minutes
const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const AWAY_THRESHOLD = 24 * 60 * 60 * 1000;     // 24 hours
```

### Customizable Behaviors
- Heartbeat frequency
- Activity tracking sensitivity
- User list filtering criteria
- Status display preferences

## Future Enhancements

### Potential Features
- Custom status messages
- Do not disturb mode
- Location-based presence
- Integration with calendar systems

### Analytics Opportunities
- User engagement patterns
- Peak activity times
- Feature usage statistics
- Performance metrics

## Troubleshooting

### Common Issues
- **Users not appearing online**: Check activity thresholds
- **Frequent status changes**: Review activity tracking logic
- **Performance issues**: Optimize database queries
- **Privacy concerns**: Verify user preference handling

### Monitoring
- Track status calculation performance
- Monitor database query efficiency
- Watch for unusual activity patterns
- Validate user privacy compliance

---

*Last Updated: 2025-06-15*
*Version: 1.0*
*Author: ChatNow Development Team*
