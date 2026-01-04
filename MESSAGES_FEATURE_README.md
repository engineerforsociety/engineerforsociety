# Messages Feature Documentation

## Overview
The Messages feature provides a real-time messaging system that allows users to communicate with each other directly within the platform.

## Database Setup

### 1. Run the SQL Migration
Execute the `messages_table_setup.sql` file in your Supabase SQL Editor:

```sql
-- This will create:
-- - messages table with proper relationships
-- - Indexes for optimized queries
-- - Row Level Security (RLS) policies
-- - Realtime subscriptions
```

### 2. Verify Setup
After running the SQL, verify that:
- ✅ The `messages` table exists
- ✅ RLS is enabled
- ✅ Policies are created
- ✅ Realtime is enabled for the table

You can check this with:
```sql
-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'messages';

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'messages';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

## Features

### ✨ Core Functionality
- **Real-time Messaging**: Messages appear instantly without page refresh
- **Conversation Management**: Organized list of all conversations
- **Read Receipts**: See when messages are delivered and read (single check vs double check)
- **User Search**: Find and start conversations with any user
- **Unread Counts**: Badge indicators for unread messages
- **Responsive Design**: Works on desktop and mobile devices

### 📱 User Interface
- **Conversations List** (Left Panel):
  - Shows all active conversations
  - Displays latest message preview
  - Shows unread message count
  - Search functionality
  - "New Message" button to start conversations

- **Chat Area** (Right Panel):
  - Message history
  - User avatar and details
  - Real-time message updates
  - Auto-scroll to latest message
  - Message input with send button

### 🔐 Security Features
- Row Level Security (RLS) policies ensure:
  - Users can only view their own messages
  - Users can only send messages as themselves
  - Users can only update messages they received (for read status)
  - Users can only delete messages they sent

## Usage

### Accessing Messages
Navigate to `/messages` in your application.

### Starting a Conversation
1. Click the "New" button in the conversations panel
2. Search for a user by name or username
3. Click on a user to start chatting
4. Type your message and press Enter or click Send

### Reading Messages
- Click on any conversation in the left panel
- Messages are automatically marked as read when you view them
- Unread count updates in real-time

### Features in Action

#### Real-time Updates
- Messages appear instantly for both sender and recipient
- Read receipts update automatically
- Conversation list refreshes when new messages arrive

#### Keyboard Shortcuts
- `Enter`: Send message
- `Shift + Enter`: New line in message

## Technical Details

### Database Schema
```sql
messages (
  id: uuid (primary key)
  sender_id: uuid (foreign key -> profiles)
  recipient_id: uuid (foreign key -> profiles)
  content: text
  is_read: boolean (default: false)
  read_at: timestamp
  created_at: timestamp (default: now())
)
```

### Indexes
- `idx_messages_recipient`: Optimizes queries for received messages
- `idx_messages_sender`: Optimizes queries for sent messages

### Real-time Subscriptions
The page subscribes to the `messages` table and listens for:
- INSERT events (new messages)
- UPDATE events (read status changes)

### Components Used
- `@/components/ui/avatar`: User avatars
- `@/components/ui/button`: Action buttons
- `@/components/ui/card`: Container components
- `@/components/ui/input`: Text input
- `@/components/ui/scroll-area`: Scrollable areas
- `@/components/ui/badge`: Unread count badges
- `lucide-react`: Icons
- `date-fns`: Time formatting

## Troubleshooting

### Messages not appearing in real-time
1. Verify Realtime is enabled in Supabase dashboard
2. Check browser console for websocket errors
3. Ensure RLS policies are correctly set up

### Can't see any conversations
1. Verify the `profiles` table has the required fields
2. Check that foreign keys are properly set up
3. Ensure user is authenticated

### Read receipts not working
1. Verify RLS policy allows updates for recipients
2. Check that `is_read` and `read_at` fields exist
3. Ensure the update query has proper permissions

## Future Enhancements
Potential features to add:
- 📎 File attachments
- 🖼️ Image sharing
- 🔍 Message search within conversations
- 🗑️ Delete messages
- ✏️ Edit sent messages
- 👀 Typing indicators
- 📌 Pin important conversations
- 🔕 Mute notifications
- 👥 Group messaging
- 📱 Push notifications

## Environment Variables Required
Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Routes (if needed in future)
Currently, the feature uses direct Supabase client calls. Future enhancements might include:
- `/api/messages/send`: Send message
- `/api/messages/list`: Get conversations
- `/api/messages/mark-read`: Bulk mark as read
- `/api/messages/delete`: Delete message

## Performance Considerations
- Messages are fetched on-demand when a conversation is selected
- Conversations list loads only once and updates via realtime
- Auto-scroll is optimized to only trigger on new messages
- Search is client-side for instant results

## Dependencies
All dependencies are already in your `package.json`:
- `@supabase/supabase-js`: Database and auth
- `@supabase/ssr`: Server-side rendering support
- `date-fns`: Date formatting
- `lucide-react`: Icons
- UI components from shadcn/ui

Enjoy your new messaging feature! 🎉
