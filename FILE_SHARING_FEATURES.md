# File Sharing Features

## Overview
The chat application now supports comprehensive file sharing functionality with a separate, reusable MessageInput component.

## Features Implemented

### 1. Separate MessageInput Component
- **Location**: `components/chat/message-input.tsx`
- **Features**:
  - Text input with typing indicators
  - File attachment button (functional on both desktop and mobile)
  - File preview before sending
  - Progress indication during upload
  - Character counter
  - Send button with loading states

### 2. File Upload Functionality
- **Supported File Types**:
  - Images: jpg, png, gif, webp, etc.
  - Documents: pdf, doc, docx, txt
  - Archives: zip, rar
  - General files up to 50MB

- **Upload Process**:
  1. User selects file via attachment button
  2. File preview is shown with option to remove
  3. Upload URL is generated via Convex
  4. File is uploaded to Convex storage
  5. Message is sent with file metadata

### 3. File Display Component
- **Location**: `components/chat/file-attachment.tsx`
- **Features**:
  - Image previews with click-to-expand
  - File type icons (document, archive, video, audio, etc.)
  - File size display
  - Download functionality
  - Responsive design for mobile and desktop

### 4. Backend Integration
- **Convex Functions**:
  - `generateUploadUrl`: Creates secure upload URLs
  - `sendMessage`: Enhanced to support file attachments
  - File metadata stored in messages table

- **Database Schema**:
  - `fileUrl`: URL to access the file
  - `fileName`: Original filename
  - `fileSize`: File size in bytes
  - `fileMimeType`: MIME type for proper handling

## Usage

### Sending Files
1. Click the paperclip icon in the message input
2. Select a file from your device
3. Preview the file and optionally add a text message
4. Click send to share the file

### Viewing Files
- **Images**: Display as previews with hover download button
- **Other Files**: Show with appropriate icons and download button
- **All Files**: Click to download or (for images) open in new tab

## Technical Details

### File Size Limits
- Maximum file size: 50MB
- Upload timeout: 2 minutes (Convex limitation)

### Security
- Upload URLs are generated server-side with session validation
- Files are stored securely in Convex storage
- Only authenticated users can upload files

### Mobile Support
- File attachment button visible on mobile
- Touch-friendly file previews
- Responsive file display components

## Components Architecture

```
ChatInterface
├── MessageInput (separate component)
│   ├── File input handling
│   ├── File preview
│   ├── Upload progress
│   └── Send functionality
└── Message Display
    └── FileAttachment (separate component)
        ├── Image previews
        ├── File type detection
        └── Download functionality
```

## Benefits

1. **Modular Design**: MessageInput is reusable across different chat contexts
2. **User Experience**: Skeleton loading, file previews, progress indicators
3. **Mobile First**: Works seamlessly on mobile devices
4. **Type Safety**: Full TypeScript support with proper typing
5. **Performance**: Efficient file handling with Convex storage
6. **Accessibility**: Proper ARIA labels and keyboard navigation

## Future Enhancements

- Drag and drop file upload
- Multiple file selection
- File compression for large images
- Voice message support
- Video/audio preview players
