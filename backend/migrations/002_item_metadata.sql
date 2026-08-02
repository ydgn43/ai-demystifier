CREATE TABLE item_metadata (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES raw_items (id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (
        category IN ('Models', 'Research', 'Developer Tools', 'Industry News')
    ),
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    jargon_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
    prompt_version TEXT NOT NULL,
    UNIQUE (item_id, prompt_version)
);
