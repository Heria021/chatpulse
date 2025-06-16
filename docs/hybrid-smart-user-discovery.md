# Hybrid Smart User Discovery System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Algorithm Logic](#core-algorithm-logic)
3. [Time Thresholds](#time-thresholds)
4. [Filter System](#filter-system)
5. [File Structure & Components](#file-structure--components)
6. [Algorithm Implementation](#algorithm-implementation)
7. [Configuration Parameters](#configuration-parameters)
8. [Section Labels](#section-labels)
9. [Edge Cases](#edge-cases)
10. [Performance Considerations](#performance-considerations)
11. [Integration Points](#integration-points)
12. [Monitoring & Analytics](#monitoring--analytics)
13. [Future Enhancements](#future-enhancements)

## Overview

The Hybrid Smart User Discovery System is a sophisticated algorithm that prioritizes user listings based on location proximity and activity levels to maximize engagement while maintaining global reach. It balances local connections with global discovery opportunities.

### Key Benefits
- **Local Discovery First:** Users see nearby active people prioritized
- **Global Reach Maintained:** International connections still available
- **Engagement Optimized:** Recently active users always visible
- **No Dead Zones:** Smart fallbacks prevent empty experiences
- **Clear Organization:** Visual sections with meaningful labels

## Core Algorithm Logic

### Priority Hierarchy
The system categorizes users into 6 priority levels:

#### 1. Recently Active + Same State (Highest Priority)
- **Threshold:** ≥5 users required
- **Activity:** Within 15 minutes
- **Location:** Same state/region as current user
- **Section Label:** "Active in [StateName]"

#### 2. Recently Active + Same Country (High Priority)
- **Threshold:** ≥10 users required
- **Activity:** Within 15 minutes
- **Location:** Same country, different state
- **Section Label:** "Active in [CountryName]"

#### 3. Recently Active + All Locations (Medium Priority)
- **Threshold:** Always shown
- **Activity:** Within 15 minutes
- **Location:** Any location
- **Section Label:** "Recently Active"

#### 4. Same State (Less Active) (Low Priority)
- **Condition:** Only if Priority 1 doesn't meet threshold
- **Activity:** Beyond 15 minutes but within 5 minutes
- **Location:** Same state/region
- **Section Label:** "From [StateName]"

#### 5. Same Country (Less Active) (Lower Priority)
- **Condition:** Only if Priority 2 doesn't meet threshold
- **Activity:** Beyond 15 minutes but within 5 minutes
- **Location:** Same country, different state
- **Section Label:** "From [CountryName]"

#### 6. All Others (Lowest Priority)
- **Activity:** Any activity level within 5 minutes
- **Location:** Any location
- **Section Label:** "Other Users"

### Special Case: No Location Set
- **Behavior:** Shows ALL users (no location-based grouping)
- **Sorting:** Apply gender and age range filters only
- **Priority:** Sort by online status and activity

## Time Thresholds

```typescript
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes (main filter)
const RECENT_ACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes (priority categorization)
```

## Filter System

### Gender Filter
- **Options:** All, Male, Female
- **Default:** All
- **Implementation:** Direct database filtering
- **Visual:** Color-coded options (Blue=Male, Pink=Female, Gray=All)

### Age Range Filter
- **Options:** All, 18-25, 26-35, 36-45, 46-55, 56+
- **Default:** All
- **Implementation:** Range-based filtering
- **Visual:** Color-coded options (Green, Yellow, Orange, Red, Purple)

### Search Filter
- **Type:** Text-based username search
- **Behavior:** Applied after location and demographic filters
- **Case:** Insensitive matching

## File Structure & Components

### Backend Implementation

#### `convex/users.ts`
**Primary Function:** `getActiveUsers`
```typescript
export const getActiveUsers = query({
  args: { 
    sessionToken: v.string(),
    searchQuery: v.optional(v.string()),
    genderFilter: v.optional(v.union(v.literal("all"), v.literal("male"), v.literal("female"))),
    ageRangeFilter: v.optional(v.union(
      v.literal("all"), v.literal("18-25"), v.literal("26-35"), 
      v.literal("36-45"), v.literal("46-55"), v.literal("56+")
    ))
  },
  handler: async (ctx, args) => {
    // Lines 20-296: Full implementation
  }
});
```

**Key Responsibilities:**
- User authentication and session validation
- Gender and age range filtering
- Activity-based filtering (5-minute threshold)
- Hybrid categorization algorithm execution
- Section labeling for UI grouping
- Blocked user filtering
- Search functionality
- Unread message count calculation

**Supporting Functions:**
- `getUsersWithMutualChats` - Chat history with location data
- Location field updates in user queries

#### `convex/chat.ts`
**Updated Function:** `getOrCreateConversation`
- **Lines:** 134-150
- **Purpose:** Returns user data with location fields for chat conversations
- **Location Fields:** `countryCode`, `countryName`, `stateCode`, `stateName`

#### `convex/schema.ts`
**Location Fields Added to Users Table:**
```typescript
// Location fields
countryCode: v.optional(v.string()), // ISO country code (e.g., "US", "IN")
countryName: v.optional(v.string()), // Full country name (e.g., "United States", "India")
stateCode: v.optional(v.string()),   // State/region code (e.g., "CA", "MH")
stateName: v.optional(v.string()),   // Full state/region name (e.g., "California", "Maharashtra")
```

### Frontend Implementation

#### `components/chat/user-list.tsx`
**Main Component:** `UserList`
- **Lines:** 67-544
- **Purpose:** Primary user discovery interface

**State Management:**
```typescript
const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
const [ageRangeFilter, setAgeRangeFilter] = useState<"all" | "18-25" | "26-35" | "36-45" | "46-55" | "56+">("all");
```

**Filter UI Implementation:**
- **Lines:** 162-253
- **Layout:** Inline horizontal layout
- **Features:** Color-coded dropdown options, clear filters functionality
- **Visual Indicators:** Active filter states

**Section Headers Display:**
- **Lines:** 376-389
- **Purpose:** Dynamic section labels based on hybrid algorithm results
- **Behavior:** Shows section header for first user in each new section

**API Integration:**
- **Lines:** 84-94
- **Query:** `api.users.getActiveUsers`
- **Parameters:** Session token, search query, gender filter, age range filter

#### `lib/types/auth.ts`
**Type Definitions Updated:**
```typescript
export interface ActiveUser {
  _id: Id<"users">;
  username: string;
  // ... existing fields
  section?: string; // For UI grouping
  countryCode?: string;
  countryName?: string;
  stateCode?: string;
  stateName?: string;
}
```

**Other Updated Interfaces:**
- `User` - Added location fields
- `ChatConversation` - Added location fields to otherUser object

#### `lib/data/locations.ts`
**Location Data Management:**
- **Countries:** 7 major countries (US, CA, IN, AU, GB, DE, FR)
- **States/Regions:** Complete data for all countries
- **Total States:** 300+ states/regions across all countries

**Helper Functions:**
```typescript
export const getCountryByCode = (code: string): Country | undefined
export const getStatesByCountry = (countryCode: string): State[]
export const getStateByCode = (stateCode: string, countryCode: string): State | undefined
export const validateStateForCountry = (stateCode: string, countryCode: string): boolean
```

## Algorithm Implementation

### User Categorization Function
**Location:** `convex/users.ts` lines 183-230
```typescript
const categorizeUsers = (users: typeof usersWithUnreadCounts) => {
  const categories = {
    recentlyActiveSameState: [],
    recentlyActiveSameCountry: [],
    recentlyActiveOthers: [],
    sameState: [],
    sameCountry: [],
    others: []
  };
  
  users.forEach(user => {
    const isRecentlyActive = timeSinceActivity < RECENT_ACTIVITY_THRESHOLD;
    const isSameState = currentUserState && user.stateCode === currentUserState;
    const isSameCountry = currentUserCountry && user.countryCode === currentUserCountry;
    
    // Categorization logic based on activity and location
  });
  
  return categories;
};
```

### Sorting Within Categories
**Location:** `convex/users.ts` lines 232-250
```typescript
const sortCategory = (users: typeof usersWithUnreadCounts) => {
  return users.sort((a, b) => {
    // 1. Unread messages priority (highest)
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    
    // 2. Online status priority
    const statusPriority = { online: 2, recently_active: 1, away: 0, offline: 0 };
    const aStatusPriority = statusPriority[a.currentStatus];
    const bStatusPriority = statusPriority[b.currentStatus];
    if (aStatusPriority !== bStatusPriority) {
      return bStatusPriority - aStatusPriority;
    }
    
    // 3. Last activity priority (most recent first)
    const aLastActivity = a.lastActivity || a.lastSeen;
    const bLastActivity = b.lastActivity || b.lastSeen;
    return bLastActivity - aLastActivity;
  });
};
```

### Section Labeling
**Location:** `convex/users.ts` lines 256-295
```typescript
const addSection = (users: typeof usersWithUnreadCounts, sectionName: string) => {
  users.forEach(user => user.section = sectionName);
  result.push(...users);
};

// Usage examples:
addSection(sortCategory(categories.recentlyActiveSameState), `Active in ${stateName}`);
addSection(sortCategory(categories.recentlyActiveSameCountry), `Active in ${countryName}`);
addSection(sortCategory(categories.recentlyActiveOthers), "Recently Active");
```

## Configuration Parameters

### Thresholds (Configurable)
```typescript
// Minimum users required for priority sections
const MIN_SAME_STATE_USERS = 5;
const MIN_SAME_COUNTRY_USERS = 10;

// Activity time windows
const ONLINE_THRESHOLD = 2 * 60 * 1000; // 2 minutes
const RECENTLY_ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const RECENT_ACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes
```

### Filter Options (Configurable)
```typescript
// Gender options
const GENDER_OPTIONS = ["all", "male", "female"];

// Age range options  
const AGE_RANGES = ["all", "18-25", "26-35", "36-45", "46-55", "56+"];
```

### UI Configuration
```typescript
// Filter UI settings
const FILTER_DROPDOWN_HEIGHT = "h-7";
const GENDER_DROPDOWN_WIDTH = "w-20";
const AGE_DROPDOWN_WIDTH = "w-16";

// Color coding for visual clarity
const GENDER_COLORS = {
  male: "bg-blue-500",
  female: "bg-pink-500", 
  all: "bg-muted-foreground"
};

const AGE_COLORS = {
  "18-25": "bg-green-500",
  "26-35": "bg-yellow-500",
  "36-45": "bg-orange-500",
  "46-55": "bg-red-500",
  "56+": "bg-purple-500"
};
```

## Section Labels

### Dynamic Labels Based on User Location
- `"Active in [StateName]"` - Recently active users in same state
- `"Active in [CountryName]"` - Recently active users in same country
- `"Recently Active"` - Recently active users from all locations
- `"From [StateName]"` - Less active users from same state
- `"From [CountryName]"` - Less active users from same country
- `"Other Users"` - All other users

### Fallback Labels
- `"Active in your state"` - When state name is not available
- `"Active in your country"` - When country name is not available

### Label Generation Logic
```typescript
// Same state section
const stateName = currentUser.stateName || "your state";
addSection(users, `Active in ${stateName}`);

// Same country section
const countryName = currentUser.countryName || "your country";
addSection(users, `Active in ${countryName}`);
```

## Edge Cases

### User Without Location
- **Behavior:** Shows all users without location-based grouping
- **Implementation:** No categorization, standard activity-based sorting
- **UI Impact:** No section headers, single user list

### Insufficient Local Users
- **Same State < 5 users:** Skip "Recently Active + Same State" section
- **Same Country < 10 users:** Skip "Recently Active + Same Country" section
- **Fallback:** Show less active local users in later sections

### Empty Sections
- **Logic:** Sections with 0 users are automatically skipped
- **UI:** No empty section headers displayed
- **Performance:** No unnecessary DOM elements created

### Blocked Users
- **Filtering:** Blocked users automatically excluded from all results
- **Bidirectional:** Users who blocked current user also excluded
- **Implementation:** Early filtering before categorization

### Guest Users
- **Behavior:** Included in discovery if they allow guest messages
- **Limitations:** May have limited profile information
- **Filtering:** Respect allowGuestMessages setting

## Performance Considerations

### Database Queries
- **Single Query:** All users fetched in one database call
- **Indexes:** Optimized queries using isActive index
- **Filtering:** Early filtering reduces processing load
- **Blocked Users:** Separate queries for blocked user lists

### Memory Usage
- **Categorization:** Users distributed into 6 arrays
- **Sorting:** In-place sorting within categories
- **Result Assembly:** Linear concatenation of sorted categories
- **Cleanup:** Temporary arrays garbage collected after use

### Client-Side Processing
- **Real-time Status:** Status calculated on each query
- **Categorization:** Done in memory after database fetch
- **Section Headers:** Generated dynamically based on results
- **UI Updates:** Efficient React re-rendering with proper keys

### Optimization Strategies
```typescript
// Efficient filtering pipeline
const users = allUsers
  .filter(user => user.isActive) // Database index
  .filter(user => !blockedUserIds.has(user._id)) // Set lookup O(1)
  .filter(user => matchesFilters(user)) // Early demographic filtering
  .filter(user => isRecentlyActive(user)); // Activity filtering
```

## Integration Points

### Profile System Integration
- **Location Data:** Sourced from user profile location fields
- **Profile Updates:** Location changes immediately affect discovery algorithm
- **Validation:** Location data validated on profile update
- **Files:** `app/profile/page.tsx`, `convex/users.ts` updateProfile

### Chat System Integration
- **Conversation Creation:** Location data included in chat user objects
- **Message Prioritization:** Unread messages boost user priority within categories
- **User Selection:** Discovery feeds directly into chat initiation
- **Files:** `convex/chat.ts`, `components/chat/user-list.tsx`

### Authentication Integration
- **Session Validation:** Required for all discovery queries
- **User Context:** Current user location drives algorithm behavior
- **Guest Handling:** Special handling for guest user discovery
- **Files:** `lib/contexts/auth-context.tsx`, `convex/auth.ts`

### Notification Integration
- **Unread Counts:** Integrated with notification system
- **Priority Boost:** Users with unread messages prioritized
- **Real-time Updates:** Discovery list updates with new messages
- **Files:** `hooks/use-unread-counts.ts`

## Monitoring & Analytics

### Key Metrics to Track
1. **Section Distribution:** How many users appear in each priority section
2. **Engagement Rates:** Click-through rates by section
3. **Local vs Global Interaction:** Ratio of local to international conversations
4. **Filter Usage:** Most commonly used filter combinations
5. **Empty Section Frequency:** How often sections have no users

### Performance Metrics
1. **Query Response Time:** Database query execution time
2. **Categorization Time:** Algorithm processing time
3. **Memory Usage:** Peak memory during user processing
4. **Cache Hit Rates:** If caching is implemented
5. **UI Render Time:** Time to display categorized results

### Analytics Implementation
```typescript
// Example tracking points
analytics.track('user_discovery_query', {
  genderFilter,
  ageRangeFilter,
  resultCount: users.length,
  sectionCounts: {
    recentlyActiveSameState: categories.recentlyActiveSameState.length,
    recentlyActiveSameCountry: categories.recentlyActiveSameCountry.length,
    // ... other sections
  },
  queryTime: Date.now() - startTime
});
```

## Future Enhancements

### Algorithm Improvements
1. **Machine Learning Integration:** Learn user preferences over time
2. **Interest-Based Matching:** Consider user interests beyond location
3. **Time Zone Awareness:** Factor in user time zones for activity prediction
4. **Seasonal Adjustments:** Adapt thresholds based on overall platform activity
5. **Collaborative Filtering:** Recommend users based on similar user interactions

### UI/UX Enhancements
1. **Filter Presets:** Save commonly used filter combinations
2. **Advanced Filters:** Add more granular location options (city-level)
3. **Sort Options:** Allow users to choose sorting preferences
4. **Section Customization:** Let users hide/show specific sections
5. **Infinite Scroll:** Load more users as user scrolls

### Performance Optimizations
1. **Caching Strategy:** Cache categorized results for short periods
2. **Pagination:** Implement virtual scrolling for large user lists
3. **Background Updates:** Update user lists in background
4. **Predictive Loading:** Pre-load likely next filter combinations
5. **Database Optimization:** Add composite indexes for common queries

### Feature Extensions
1. **Location Radius:** Allow users to set custom distance preferences
2. **Activity Predictions:** Predict when users are likely to be active
3. **Mutual Connections:** Show users with mutual friends/connections
4. **Interest Tags:** Filter by shared interests or hobbies
5. **Language Preferences:** Consider language compatibility

## Troubleshooting Guide

### Common Issues

#### No Users Appearing
- **Check:** User has location set in profile
- **Check:** Filters not too restrictive
- **Check:** Users exist within activity threshold
- **Solution:** Adjust time thresholds or expand location criteria

#### Section Headers Not Showing
- **Check:** User section property is being set correctly
- **Check:** UI component is checking for section changes
- **Solution:** Verify section labeling logic in backend

#### Performance Issues
- **Check:** Database query performance
- **Check:** Number of users being processed
- **Solution:** Implement pagination or caching

#### Filter Not Working
- **Check:** Filter values being passed to backend correctly
- **Check:** Backend filter logic implementation
- **Solution:** Debug filter application in query handler

### Debug Tools
```typescript
// Add to development environment
console.log('User categories:', {
  recentlyActiveSameState: categories.recentlyActiveSameState.length,
  recentlyActiveSameCountry: categories.recentlyActiveSameCountry.length,
  recentlyActiveOthers: categories.recentlyActiveOthers.length,
  sameState: categories.sameState.length,
  sameCountry: categories.sameCountry.length,
  others: categories.others.length
});
```

## Quick Reference

### File Locations
- **Main Algorithm:** `convex/users.ts` (lines 20-296)
- **UI Component:** `components/chat/user-list.tsx` (lines 67-544)
- **Type Definitions:** `lib/types/auth.ts`
- **Location Data:** `lib/data/locations.ts`
- **Schema:** `convex/schema.ts`

### Key Functions
- `getActiveUsers()` - Main discovery query
- `categorizeUsers()` - Algorithm implementation
- `sortCategory()` - Within-category sorting
- `addSection()` - Section labeling

### Configuration Values
- **State Threshold:** 5 users
- **Country Threshold:** 10 users
- **Activity Window:** 15 minutes
- **Main Filter:** 5 minutes
- **Online Status:** 2 minutes

---

**Document Version:** 1.0
**Last Updated:** 2025-01-16
**Maintained By:** Development Team
**Review Schedule:** Monthly

**For Updates:** When modifying the algorithm, update this documentation to reflect changes in thresholds, logic, or implementation details.

## Implementation Checklist

### When Adding New Filters
- [ ] Add filter option to `convex/users.ts` args
- [ ] Update filter logic in `getActiveUsers` handler
- [ ] Add UI control to `components/chat/user-list.tsx`
- [ ] Update `ActiveUser` interface in `lib/types/auth.ts`
- [ ] Add color coding for visual clarity
- [ ] Test filter combinations
- [ ] Update this documentation

### When Modifying Thresholds
- [ ] Update constants in `convex/users.ts`
- [ ] Test impact on user distribution
- [ ] Monitor engagement metrics
- [ ] Update documentation values
- [ ] Consider A/B testing for optimization

### When Adding New Location Data
- [ ] Update `lib/data/locations.ts`
- [ ] Add new countries to `COUNTRIES` array
- [ ] Add states/regions to `STATES` array
- [ ] Test location validation functions
- [ ] Verify UI dropdown population

### When Modifying Section Logic
- [ ] Update categorization in `convex/users.ts`
- [ ] Test section header generation
- [ ] Verify UI section display
- [ ] Update section label documentation
- [ ] Test edge cases (empty sections)

## API Reference

### Query Parameters
```typescript
// getActiveUsers query parameters
{
  sessionToken: string;           // Required: User session
  searchQuery?: string;           // Optional: Username search
  genderFilter?: "all" | "male" | "female";  // Optional: Gender filter
  ageRangeFilter?: "all" | "18-25" | "26-35" | "36-45" | "46-55" | "56+";  // Optional: Age filter
}
```

### Response Format
```typescript
// ActiveUser response format
{
  _id: Id<"users">;
  username: string;
  isOnline: boolean;
  currentStatus: "online" | "recently_active" | "away" | "offline";
  lastSeen: number;
  lastActivity?: number;
  isGuest: boolean;
  bio?: string;
  age: number;
  gender: "male" | "female" | "other";
  countryCode?: string;
  countryName?: string;
  stateCode?: string;
  stateName?: string;
  allowGuestMessages: boolean;
  showOnlineStatus: boolean;
  unreadCount: number;
  section?: string;  // UI grouping section
}
```

## Testing Scenarios

### Unit Tests
1. **Filter Logic Testing**
   - Test each filter independently
   - Test filter combinations
   - Test edge cases (no results)

2. **Categorization Testing**
   - Test with various user distributions
   - Test threshold boundaries
   - Test location edge cases

3. **Sorting Testing**
   - Test priority ordering
   - Test within-category sorting
   - Test unread message priority

### Integration Tests
1. **End-to-End User Flow**
   - User sets location in profile
   - Location affects discovery results
   - Filters work correctly
   - Section headers display properly

2. **Performance Testing**
   - Large user datasets
   - Multiple concurrent queries
   - Memory usage monitoring

### Manual Testing Checklist
- [ ] Test with user having no location
- [ ] Test with user in small state (< 5 users)
- [ ] Test with user in small country (< 10 users)
- [ ] Test all filter combinations
- [ ] Test search functionality
- [ ] Test section header display
- [ ] Test mobile responsiveness
- [ ] Test with blocked users
- [ ] Test with guest users

## Deployment Notes

### Database Migrations
When deploying location features:
1. Existing users will have `null` location fields
2. Algorithm gracefully handles missing location data
3. No migration required - fields are optional

### Feature Flags
Consider implementing feature flags for:
- Hybrid algorithm enable/disable
- Individual filter enable/disable
- Threshold adjustments
- Section display toggle

### Monitoring Setup
Set up monitoring for:
- Query performance metrics
- User engagement by section
- Filter usage statistics
- Error rates and edge cases

## Version History

### v1.0 (Current)
- Initial implementation of hybrid algorithm
- Basic gender and age filters
- Location-based prioritization
- Section headers and visual organization
- Simple inline filter UI

### Planned v1.1
- Performance optimizations
- Additional filter options
- Enhanced analytics
- Mobile UX improvements

### Planned v2.0
- Machine learning integration
- Interest-based matching
- Advanced location features
- Personalization options
