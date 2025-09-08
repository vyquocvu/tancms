-- Remove post-related tables and columns

-- Drop the many-to-many relationship table first
DROP TABLE IF EXISTS "_PostToTag";

-- Drop the Post table
DROP TABLE IF EXISTS "Post";

-- Drop the PostStatus enum
-- Note: In SQLite, we can't drop enums directly, but they're just check constraints
-- so we don't need to explicitly drop them