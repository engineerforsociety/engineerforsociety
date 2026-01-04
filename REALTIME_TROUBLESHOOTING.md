# Real-time Messaging Troubleshooting Guide

## Quick Checklist

### ✅ Step 1: Verify Supabase Realtime is Enabled
1. Go to Supabase Dashboard → Database → Replication
2. Make sure `supabase_realtime` publication exists
3. Check if `messages` table is listed in the publication

### ✅ Step 2: Check the SQL Migration Was Run
Run this query in Supabase SQL Editor to verify:

```sql
-- Check if messages table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'messages';

-- Check if realtime is enabled
SELECT schemaname, tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'messages';
```

Expected results:
- First query should return `messages`
- Second query should return `public | messages`

If the second query returns nothing, run this:
```sql
alter publication supabase_realtime add table public.messages;
```

### ✅ Step 3: Check Browser Console
Open browser Developer Tools (F12) and check the Console tab. You should see:

**When page loads:**
```
Setting up realtime subscription for user: [user-id]
Realtime subscription status: SUBSCRIBED
```

**When you send a message:**
```
Realtime event (sent): {eventType: "INSERT", ...}
Processing realtime payload: ...
New message inserted: ...
Adding message to conversation: ...
```

**When you receive a message:**
```
Realtime event (received): {eventType: "INSERT", ...}
Processing realtime payload: ...
```

### ✅ Step 4: Test Real-time Functionality

**Setup:**
1. Open Browser Window 1 → Login as User A → Go to `/messages`
2. Open Browser Window 2 (or Incognito) → Login as User B → Go to `/messages`

**Test sending:**
1. In Window 1 (User A): Start a conversation with User B
2. Send a message: "Hello from User A"
3. **Check Window 1 console** - should see:
   ```
   Realtime event (sent): ...
   Processing realtime payload: ...
   ```
4. **Check Window 2 console** - should see:
   ```
   Realtime event (received): ...
   Adding message to conversation: ...
   ```

**Expected results:**
- ❌ If Window 2 doesn't show the message → Realtime is not working
- ✅ If Window 2 shows the message immediately → SUCCESS!

## Common Issues & Fixes

### Issue 1: "Realtime subscription status: CHANNEL_ERROR"

**Cause:** Realtime not enabled or table not in publication

**Fix:**
```sql
-- Enable realtime for messages table
alter publication supabase_realtime add table public.messages;
```

Then refresh the page.

### Issue 2: Nothing in console logs

**Cause:** Old cached code running

**Fix:**
1. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache
3. Restart dev server: Stop `npm run dev` and start again

### Issue 3: Message appears but with delay

**Cause:** This is actually normal! Real-time can have 100-500ms latency

**Expected behavior:** Messages should appear within 1 second

### Issue 4: "Setting up realtime subscription" appears multiple times

**Cause:** React strict mode causing double renders (normal in development)

**Fix:** This is normal in development mode. In production this won't happen.

### Issue 5: Permission denied errors in console

**Cause:** RLS policies not set up correctly

**Fix:**
```sql
-- Re-run the RLS policies from messages_table_setup.sql
-- Specifically these sections:

-- Enable RLS
alter table public.messages enable row level security;

-- Recreate policies
drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);
```

### Issue 6: Read receipts not updating

**Cause:** UPDATE events not being captured

**Fix:** 
1. Check console for "Message updated:" logs
2. If not appearing, verify realtime subscription includes UPDATE events
3. The subscription should have `event: '*'` (all events)

## Verify Everything is Working

Run this complete test:

**Terminal 1:** Check dev server is running
```bash
# Should show: Running on port 9002
npm run dev
```

**Browser 1 (User A):**
1. Login → Go to `/messages`
2. Open console (F12)
3. Look for: "Setting up realtime subscription"
4. Status should be: "SUBSCRIBED"

**Browser 2 (User B - Incognito):**
1. Login → Go to `/messages`
2. Open console (F12)
3. Look for: "Setting up realtime subscription"
4. Status should be: "SUBSCRIBED"

**Send test message:**
1. User A: Click "New" → Select User B → Send "Test message"
2. Watch console in both windows
3. **User A console should show:** "Realtime event (sent)"
4. **User B console should show:** "Realtime event (received)"
5. **User B should SEE the message appear immediately!**

If all logs appear and message shows up → **✅ REALTIME IS WORKING!**

## Advanced Debugging

Still not working? Check these:

### Network Tab
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. You should see a connection to `realtime-v2.supabase.co`
4. Status should be "101 Switching Protocols" (success)

### Supabase Dashboard Logs
1. Supabase Dashboard → Logs → Realtime Logs
2. Check for any errors when sending messages

### Environment Variables
Verify your `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Still Having Issues?

Check the code updates were applied:

```typescript
// In src/app/messages/page.tsx, around line 69-118

// Should have TWO separate useEffects:

1. One for initial data fetch (line 69-74)
useEffect(() => {
  fetchUser();
  fetchConversations();
  fetchAllUsers();
}, []);

2. One for realtime subscription (line 76-118)
useEffect(() => {
  if (!user) return;
  
  console.log('Setting up realtime subscription...');
  
  const channel = supabase
    .channel('messages-realtime')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${user.id}`  // ← IMPORTANT
      }, ...)
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${user.id}`  // ← IMPORTANT
      }, ...)
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [user?.id, selectedConversation?.id]);
```

The key changes:
- ✅ Two separate filters (sender_id and recipient_id)
- ✅ Console logs for debugging
- ✅ Proper cleanup
- ✅ Depends on user and selectedConversation

## Success Indicators

You'll know realtime is working when:
- ✅ Console shows "SUBSCRIBED" status
- ✅ Messages appear instantly without refresh
- ✅ Read receipts update (single check → double check)
- ✅ Unread counts update in conversation list
- ✅ Both users see messages in real-time

---

**Need more help?** Check the console logs - they'll tell you exactly what's happening!
