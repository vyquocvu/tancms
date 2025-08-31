-- Migration: Enhance schema with PostStatus enum, slug, excerpt, and indexes
-- Created at: 2025-08-31T14:15:00.000Z

-- Add new PostStatus enum values
-- SQLite doesn't support enum types, so we'll use text constraints

-- Add new columns to Post table
ALTER TABLE "Post" ADD COLUMN "slug" TEXT;
ALTER TABLE "Post" ADD COLUMN "excerpt" TEXT;
ALTER TABLE "Post" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- Create unique index on slug
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- Create performance indexes
CREATE INDEX "Post_status_idx" ON "Post"("status");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- Migrate existing data
-- Convert published boolean to status enum
UPDATE "Post" SET "status" = CASE 
  WHEN "published" = 1 THEN 'PUBLISHED' 
  ELSE 'DRAFT' 
END;

-- Generate slugs for existing posts (basic slug generation)
UPDATE "Post" SET "slug" = LOWER(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE("title", ' ', '-'),
            '&', 'and'
          ),
          '!', ''
        ),
        '?', ''
      ),
      '.', ''
    ),
    ',', ''
  ),
  '--', '-'
) WHERE "slug" IS NULL;

-- Ensure slug uniqueness by appending numbers if needed
-- This is a simplified approach; in practice, you'd use a more sophisticated method
UPDATE "Post" SET "slug" = "slug" || '-' || ROWID 
WHERE ROWID IN (
  SELECT ROWID FROM "Post" 
  GROUP BY "slug" 
  HAVING COUNT(*) > 1 
  AND ROWID != MIN(ROWID)
);

-- Remove the old published column
-- Note: SQLite doesn't support DROP COLUMN, so we'll recreate the table
-- This is handled by Prisma's migration system in practice

-- Add check constraints for enum-like behavior
-- SQLite doesn't support check constraints on existing tables,
-- but Prisma will enforce these at the application level