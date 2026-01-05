-- =============================================
-- CONNECTIONS AND NOTIFICATIONS FULL SETUP
-- =============================================

-- 1. Connections Table (Tracks friendship/follow requests)
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  requester_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT connections_pkey PRIMARY KEY (id),
  CONSTRAINT connections_requester_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
  CONSTRAINT connections_receiver_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
  CONSTRAINT connections_unique_pair UNIQUE (requester_id, receiver_id),
  CONSTRAINT connections_status_check CHECK (status IN ('pending', 'accepted', 'rejected')),
  CONSTRAINT connections_no_self_connect CHECK (requester_id != receiver_id)
) TABLESPACE pg_default;

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections (requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON public.connections (receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections (status);

-- Enable RLS for Connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;
CREATE POLICY "Users can view their own connections" ON public.connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can create their own connection requests" ON public.connections;
CREATE POLICY "Users can create their own connection requests" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update their own connection status" ON public.connections;
CREATE POLICY "Users can update their own connection status" ON public.connections
  FOR UPDATE USING (auth.uid() = receiver_id);

-- 2. Notification Triggers for Connections
CREATE OR REPLACE FUNCTION public.handle_connection_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- When someone sends a request
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (user_id, type, title, content, action_url)
    VALUES (
      NEW.receiver_id,
      'connection_request',
      'New Connection Request',
      (SELECT COALESCE(full_name, username) FROM public.profiles WHERE id = NEW.requester_id) || ' wants to connect with you.',
      '/profile?userId=' || NEW.requester_id
    );
  -- When someone accepts a request
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted') THEN
    INSERT INTO public.notifications (user_id, type, title, content, action_url)
    VALUES (
      NEW.requester_id,
      'connection_accepted',
      'Connection Accepted',
      (SELECT COALESCE(full_name, username) FROM public.profiles WHERE id = NEW.receiver_id) || ' accepted your connection request.',
      '/profile?userId=' || NEW.receiver_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_connection_change ON public.connections;
CREATE TRIGGER on_connection_change
  AFTER INSERT OR UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_connection_notification();

-- 3. Message Notification Trigger
CREATE OR REPLACE FUNCTION public.handle_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, action_url)
  VALUES (
    NEW.recipient_id,
    'new_message',
    'New Message',
    (SELECT COALESCE(full_name, username) FROM public.profiles WHERE id = NEW.sender_id) || ' sent you a message.',
    '/messages?userId=' || NEW.sender_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_sent ON public.messages;
CREATE TRIGGER on_message_sent
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_message_notification();

-- 4. Enable Real-time for Notifications Table
-- Note: This is usually done in the Supabase Dashboard, but here is the SQL
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. Messaging Restriction: Only allowed if connected (Accepted status)
DROP POLICY IF EXISTS "Users can only message their connections" ON public.messages;
CREATE POLICY "Users can only message their connections" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.connections
      WHERE status = 'accepted'
      AND (
        (requester_id = auth.uid() AND receiver_id = recipient_id)
        OR
        (requester_id = recipient_id AND receiver_id = auth.uid())
      )
    )
  );

-- 6. Grant Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
