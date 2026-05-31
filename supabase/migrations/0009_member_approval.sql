-- Add awaiting_approval status so accepted invites sit in a holding state
-- until the workspace owner explicitly approves them.
-- Flow: pending → awaiting_approval (on accept) → active (on owner approval)
--                                               → revoked (on owner reject)

alter type invite_status add value if not exists 'awaiting_approval' after 'pending';
