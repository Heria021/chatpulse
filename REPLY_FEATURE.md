# Reply to Message Feature

## Overview
Implemented a comprehensive reply-to-message feature with mobile-first design, skeleton loading, and clean UI components.

## Features Implemented

### 1. **Enhanced Backend Support**
- **Location**: `convex/chat.ts`
- **Features**:
  - Enhanced `getMessages` to include original message details for replies
  - Reply validation in `sendMessage` mutation
  - Original message metadata included in response
  - Support for replying to text, image, and file messages

### 2. **ReplyPreview Component**
- **Location**: `components/chat/reply-preview.tsx`
- **Features**:
  - Clean preview of the original message being replied to
  - File type icons for image/file replies
  - Truncated text preview for long messages
  - Responsive design with proper styling
  - Sender name display

### 3. **Enhanced MessageArea Component**
- **Location**: `components/chat/message-area.tsx`
- **Features**:
  - Double-click to reply functionality
  - Hover effects on message bubbles
  - Reply preview display in messages
  - Mobile-friendly touch interactions

### 4. **Enhanced MessageInput Component**
- **Location**: `components/chat/message-input.tsx`
- **Features**:
  - Reply preview above input area
  - Cancel reply functionality
  - Reply context in message sending
  - Clean UI with reply indicator

### 5. **Updated Type Definitions**
- **Location**: `lib/types/auth.ts`
- **Features**:
  - Extended `ChatMessage` interface
  - Reply message metadata support
  - Type safety for reply functionality

## User Experience

### How to Reply
1. **Double-click** any message bubble to reply
2. **Reply preview** appears above the input area
3. **Type your reply** in the message input
4. **Send** the reply (includes original message context)
5. **Cancel** reply by clicking the X button

### Reply Display
- **Original Message Preview**: Shows sender name and message content
- **File Replies**: Shows file type icon and filename
- **Image Replies**: Shows camera icon and filename
- **Text Replies**: Shows truncated text content
- **Clean Design**: Minimal, non-intrusive reply indicators

## Technical Implementation

### Backend Changes
```typescript
// Enhanced message retrieval with reply details
const messagesWithSenders = await Promise.all(
  chronologicalMessages.map(async (message) => {
    // Get reply details if this message is a reply
    let replyToMessage = null;
    if (message.replyToMessageId) {
      const originalMessage = await ctx.db.get(message.replyToMessageId);
      if (originalMessage) {
        const originalSender = await ctx.db.get(originalMessage.senderId);
        replyToMessage = {
          _id: originalMessage._id,
          content: originalMessage.content,
          type: originalMessage.type,
          senderUsername: originalSender?.username || "Unknown User",
          fileName: originalMessage.fileName,
          fileMimeType: originalMessage.fileMimeType
        };
      }
    }
    // ... rest of message data
  })
);
```

### Frontend Components
```typescript
// Reply functionality in MessageArea
<div
  className="message-bubble cursor-pointer"
  onDoubleClick={() => onReplyToMessage?.(msg)}
  title="Double-click to reply"
>
  {msg.replyToMessage && (
    <ReplyPreview
      replyToMessage={msg.replyToMessage}
      isOwn={msg.isOwn}
    />
  )}
  {/* Message content */}
</div>
```

### State Management
```typescript
// Reply state in ChatInterface
const [replyToMessage, setReplyToMessage] = useState<ReplyMessage | null>(null);

const handleReplyToMessage = (message: ChatMessage) => {
  setReplyToMessage({
    _id: message._id,
    content: message.content,
    type: message.type,
    senderUsername: message.senderUsername,
    fileName: message.fileName,
    fileMimeType: message.fileMimeType
  });
};
```

## Design Principles

### 1. **Mobile-First**
- Touch-friendly double-tap interaction
- Responsive reply preview
- Compact UI elements
- Thumb-friendly cancel button

### 2. **Clean UI**
- Minimal reply indicators
- Non-intrusive preview
- Consistent with existing design
- Proper spacing and typography

### 3. **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- Clear visual hierarchy
- Proper ARIA labels

### 4. **Performance**
- Efficient database queries
- Minimal re-renders
- Optimized reply data structure
- Fast reply interactions

## File Structure
```
components/chat/
├── reply-preview.tsx          # Reply preview component
├── message-area.tsx           # Enhanced with reply functionality
├── message-input.tsx          # Enhanced with reply state
└── chat-interface.tsx         # Reply state management

lib/types/
└── auth.ts                    # Updated ChatMessage interface

convex/
└── chat.ts                    # Enhanced with reply details
```

## Usage Examples

### Basic Text Reply
1. Double-click on any text message
2. Type your reply
3. Send (automatically includes reply context)

### File/Image Reply
1. Double-click on file or image message
2. Reply preview shows file icon and name
3. Type your response
4. Send reply

### Cancel Reply
1. Start a reply
2. Click X button in reply preview
3. Reply context is cleared

## Benefits

### 1. **Enhanced Communication**
- Context preservation in conversations
- Clear message threading
- Better conversation flow
- Reduced confusion in group chats

### 2. **User Experience**
- Intuitive double-click interaction
- Visual reply context
- Easy reply cancellation
- Mobile-optimized design

### 3. **Technical Benefits**
- Type-safe implementation
- Efficient data fetching
- Clean component architecture
- Extensible design

## Future Enhancements

### Potential Improvements
- **Swipe to Reply**: Mobile swipe gesture
- **Reply Threads**: Nested conversation view
- **Reply Notifications**: Highlight when someone replies to you
- **Quote Reply**: Select specific text to reply to
- **Reply Chains**: Visual threading for multiple replies
- **Reply Search**: Search within reply threads

### Advanced Features
- **Voice Reply**: Reply to voice messages with voice
- **Reaction Replies**: Quick emoji responses
- **Forward with Reply**: Forward message with reply context
- **Reply Templates**: Quick reply suggestions

This implementation provides a solid foundation for message threading and can be easily extended with additional reply features as needed.
