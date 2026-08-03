-- The GitHub fetcher previously had no AI/ML topical filter (just
-- "recently created, sorted by stars"), so rows ingested before that fix
-- are mostly unrelated to AI. Clear them out; ON DELETE CASCADE takes their
-- summaries/articles/item_metadata with them. Next ingest repopulates
-- GitHub with the topic-filtered fetcher.
DELETE FROM raw_items WHERE source = 'github';
