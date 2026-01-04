# Real-time Messaging Test Checklist ✓

## Pre-Test Setup

### ☐ Database Setup Complete
```sql
-- Run this query to verify:
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'messages';

-- Should return: messages
-- If not, run: alter publication supabase_realtime add table public.messages;
```

### ☐ Dev Server Running
```bash
npm run dev
# Should be running on http://localhost:9002
```

### ☐ Two Browser Windows Ready
- Window 1: Normal browser (User A)
- Window 2: Incognito/Private window (User B)

---

## Test 1: Connection & Setup ✓

### Window 1 (User A):
- [ ] Navigate to `http://localhost:9002/messages`
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for log: `"Setting up realtime subscription for user:"`
- [ ] Look for log: `"Realtime subscription status: SUBSCRIBED"`
- [ ] ✅ **PASS** if you see "SUBSCRIBED"
- [ ] ❌ **FAIL** if you see "CHANNEL_ERROR" or "TIMED_OUT"

### Window 2 (User B):
- [ ] Login as different user
- [ ] Navigate to `http://localhost:9002/messages`
- [ ] Open DevTools (F12) → Console tab
- [ ] Look for log: `"Setting up realtime subscription for user:"`
- [ ] Look for log: `"Realtime subscription status: SUBSCRIBED"`
- [ ] ✅ **PASS** if both windows show "SUBSCRIBED"

---

## Test 2: Send Message (A → B) ✓

### User A Actions:
- [ ] Click "New" button in conversations panel
- [ ] Search and select User B from the list
- [ ] Type message: "Test message 1"
- [ ] Press Enter or click Send button
- [ ] Message appears in your chat immediately
- [ ] Message shows single check mark (✓)

### User A Console Should Show:
```
Realtime event (sent): {eventType: "INSERT", ...}
Processing realtime payload: ...
```

### User B Console Should Show:
```
Realtime event (received): {eventType: "INSERT", ...}
Processing realtime payload: ...
New message inserted: ...
Adding message to conversation: ...
Auto-marking message as read
```

### User B UI:
- [ ] Conversation appears in left panel automatically
- [ ] Message "Test message 1" appears in chat
- [ ] Badge shows "1" unread message (before opening)
- [ ] Click on conversation to open it
- [ ] Unread badge disappears

### User A UI (after B reads):
- [ ] Single check (✓) changes to double check (✓✓)
- [ ] ✅ **PASS** if message appears in both windows instantly

---

## Test 3: Send Message (B → A) ✓

### User B Actions:
- [ ] Type message: "Reply from B"
- [ ] Press Enter
- [ ] Message appears in your chat immediately

### User A:
- [ ] Message appears instantly WITHOUT refresh
- [ ] Conversation moves to top of list
- [ ] Badge shows unread count
- [ ] ✅ **PASS** if message appears instantly

---

## Test 4: Multiple Messages ✓

### Send rapidly:
- [ ] User A: "Message 1"
- [ ] User A: "Message 2"
- [ ] User A: "Message 3"
- [ ] User B: "Reply 1"
- [ ] User B: "Reply 2"

### Verify:
- [ ] All messages appear in both windows
- [ ] Messages appear in correct order
- [ ] No duplicate messages
- [ ] Chat auto-scrolls to latest message
- [ ] ✅ **PASS** if all messages appear correctly

---

## Test 5: Read Receipts ✓

### User A:
- [ ] Send message to User B
- [ ] Initial status: Single check (✓)
- [ ] Keep window open

### User B:
- [ ] Open conversation with User A
- [ ] Message is automatically marked as read

### User A:
- [ ] Check mark updates to double check (✓✓)
- [ ] Console shows: `"Message updated:"`
- [ ] ✅ **PASS** if read receipt updates automatically

---

## Test 6: Unread Counts ✓

### User A:
- [ ] Send 3 messages to User B
- [ ] Don't open the conversation in User B window yet

### User B:
- [ ] Conversation list shows badge with "3"
- [ ] Click on conversation
- [ ] Badge disappears
- [ ] ✅ **PASS** if unread count is accurate

---

## Test 7: New Conversation ✓

### User A:
- [ ] Click "New" button
- [ ] Search for User C (third user)
- [ ] Select User C
- [ ] Send message: "Hello User C"

### User C (open new window):
- [ ] Login as User C
- [ ] Go to `/messages`
- [ ] New conversation from User A appears automatically
- [ ] Message is visible
- [ ] ✅ **PASS** if conversation appears without refresh

---

## Test 8: Conversation List Updates ✓

### User B:
- [ ] Have multiple conversations open
- [ ] User A sends new message

### Verify:
- [ ] User A's conversation moves to top of list
- [ ] Last message preview updates
- [ ] Timestamp updates
- [ ] Unread badge appears
- [ ] ✅ **PASS** if list updates automatically

---

## Test 9: Multi-device Sync ✓

### User A - Window 1:
- [ ] Send message to User B

### User A - Window 2 (same user, different window):
- [ ] Open `/messages` in another tab
- [ ] Your sent message appears in both windows
- [ ] Read receipts sync across both windows
- [ ] ✅ **PASS** if state syncs across windows

---

## Test 10: Performance & Edge Cases ✓

### Rapid messages:
- [ ] Send 20 messages quickly
- [ ] All messages appear
- [ ] No lag or freezing
- [ ] Correct order maintained

### Long messages:
- [ ] Send message with 500+ characters
- [ ] Message displays correctly
- [ ] Text wraps properly

### Special characters:
- [ ] Send: "Hello! 😊 Test @mention #hashtag"
- [ ] Displays correctly in both windows

### Network:
- [ ] Close User B window completely
- [ ] User A sends message
- [ ] Reopen User B window
- [ ] Message appears (loaded from database)
- [ ] ✅ **PASS** if all edge cases work

---

## Console Verification ✓

### Throughout all tests, console should show:

**When connected:**
```
✅ Setting up realtime subscription for user: [uuid]
✅ Realtime subscription status: SUBSCRIBED
```

**When sending:**
```
✅ Realtime event (sent): {eventType: "INSERT", ...}
✅ Processing realtime payload: ...
✅ Refreshing conversations list
```

**When receiving:**
```
✅ Realtime event (received): {eventType: "INSERT", ...}
✅ New message inserted: ...
✅ Adding message to conversation: ...
✅ Auto-marking message as read
```

**When read:**
```
✅ Realtime event (sent/received): {eventType: "UPDATE", ...}
✅ Message updated: ...
```

---

## Network Tab Verification ✓

### Check WebSocket connection:
- [ ] Open DevTools → Network tab
- [ ] Filter: WS (WebSocket)
- [ ] Should see connection to `realtime-v2.supabase.co`
- [ ] Status: `101 Switching Protocols` (green)
- [ ] Messages tab shows realtime events
- [ ] ✅ **PASS** if WebSocket is connected

---

## Final Checklist Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Connection Setup | ☐ | Both users subscribed |
| 2. Send A → B | ☐ | Instant delivery |
| 3. Send B → A | ☐ | Instant delivery |
| 4. Multiple Messages | ☐ | Correct order |
| 5. Read Receipts | ☐ | ✓ → ✓✓ |
| 6. Unread Counts | ☐ | Accurate badges |
| 7. New Conversation | ☐ | Auto-appears |
| 8. List Updates | ☐ | Auto-refresh |
| 9. Multi-device | ☐ | Syncs properly |
| 10. Edge Cases | ☐ | No errors |

---

## Success Criteria

**All tests pass (✅) if:**
- ✓ Messages appear within 1 second
- ✓ No page refresh needed
- ✓ Console shows "SUBSCRIBED"
- ✓ Read receipts update automatically
- ✓ Unread counts are accurate
- ✓ No duplicate messages
- ✓ No errors in console

---

## If Any Test Fails

1. **Check console for errors**
2. **Verify database setup** (realtime publication)
3. **Hard refresh browser** (Ctrl+Shift+R)
4. **Restart dev server**
5. **See** `REALTIME_TROUBLESHOOTING.md`

---

## Notes

- ⚡ Real-time has ~100-500ms latency (normal)
- 🔄 In dev mode, React may double-render (normal)
- 📱 Mobile testing: Test on actual device for best results
- 🌐 Network: Test on same and different networks

---

**All tests passed? Congratulations! 🎉 Your real-time messaging is working perfectly!**
