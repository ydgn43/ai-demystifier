CREATE TABLE articles (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES raw_items (id) ON DELETE CASCADE,
    level SMALLINT NOT NULL CHECK (level IN (1, 2)),
    body TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    UNIQUE (item_id, level, prompt_version)
);
