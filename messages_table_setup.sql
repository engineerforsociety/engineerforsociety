-- Create messages table
create table if not exists public.messages (
  id uuid not null default extensions.uuid_generate_v4 (),
  sender_id uuid null,
  recipient_id uuid null,
  content text not null,
  is_read boolean null default false,
  read_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_recipient_id_fkey foreign key (recipient_id) references profiles (id) on delete cascade,
  constraint messages_sender_id_fkey foreign key (sender_id) references profiles (id) on delete cascade
) tablespace pg_default;

-- Create index for faster queries on recipient messages
create index if not exists idx_messages_recipient on public.messages using btree (recipient_id, created_at desc) tablespace pg_default;

-- Create index for faster queries on sender messages
create index if not exists idx_messages_sender on public.messages using btree (sender_id, created_at desc) tablespace pg_default;

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Policy: Users can view messages they sent or received
create policy "Users can view their own messages"
  on public.messages
  for select
  using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

-- Policy: Users can insert messages where they are the sender
create policy "Users can send messages"
  on public.messages
  for insert
  with check (
    auth.uid() = sender_id
  );

-- Policy: Users can update their received messages (for marking as read)
create policy "Users can update received messages"
  on public.messages
  for update
  using (
    auth.uid() = recipient_id
  )
  with check (
    auth.uid() = recipient_id
  );

-- Policy: Users can delete messages they sent
create policy "Users can delete their sent messages"
  on public.messages
  for delete
  using (
    auth.uid() = sender_id
  );

-- Grant permissions
grant all on public.messages to authenticated;
grant all on public.messages to service_role;

-- Enable realtime for messages table
alter publication supabase_realtime add table public.messages;

-- Comment on table
comment on table public.messages is 'Stores direct messages between users';
