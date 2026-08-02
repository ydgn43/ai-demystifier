CREATE TABLE raw_items (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL,
    external_id TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    raw_text TEXT,
    published_at TIMESTAMPTZ,
    metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source, external_id)
);

CREATE TABLE summaries (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL REFERENCES raw_items (id) ON DELETE CASCADE,
    level SMALLINT NOT NULL CHECK (level IN (1, 2)),
    body TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    UNIQUE (item_id, level, prompt_version)
);
