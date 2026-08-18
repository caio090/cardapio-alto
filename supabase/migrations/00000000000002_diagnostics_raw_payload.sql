-- Keep the full Typebot webhook payload even if our normalization logic
-- guesses a variable name wrong — nothing is ever silently lost.
alter table public.diagnostics add column raw_payload jsonb;
