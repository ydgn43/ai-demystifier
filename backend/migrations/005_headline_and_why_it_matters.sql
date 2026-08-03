-- Supports the design system's "rewritten headline vs. original technical
-- title" distinction, and the detail page's "why this matters" callout.
-- Level-independent (headline) and level-dependent (why_it_matters_*)
-- fields both live directly on item_metadata rather than a new table --
-- just three text columns, not a repeating structure that needs one.
ALTER TABLE item_metadata
    ADD COLUMN headline TEXT,
    ADD COLUMN why_it_matters_casual TEXT,
    ADD COLUMN why_it_matters_developer TEXT;
