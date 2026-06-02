-- Conversation summary columns for token-optimized context loading.
-- Instead of sending the full message history to Claude, the system
-- stores a rolling summary and replays only the last few messages.

alter table public.conversations
  add column if not exists summary                text,
  add column if not exists summary_through_msg_id uuid,
  add column if not exists message_count          integer not null default 0;

comment on column public.conversations.summary
  is 'Compact summary of the conversation so far, used to replace full history in Claude calls';
comment on column public.conversations.summary_through_msg_id
  is 'Last message ID included in the summary — newer messages are sent verbatim';
comment on column public.conversations.message_count
  is 'Cached count of messages (avoids a counting query on every request)';
