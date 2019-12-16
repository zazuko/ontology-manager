-- creating a proposals now works like this:
-- * create a draft, status = initial_draft
-- submit it, status = open, etc, the rest stays the same as before:
-- reject -> rejected
-- resolve -> resolved
-- hide -> hidden

-- this allows us to trigger on proposal edits, ie.
-- we log a 'submit' when status = 'initial_draft'
-- we log an 'edit' when status = 'open'
alter type editor_schema.status add value 'initial_draft' after 'rejected';
