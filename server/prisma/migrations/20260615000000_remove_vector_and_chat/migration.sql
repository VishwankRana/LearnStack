-- Remove Phase 10 chat tables
DROP TABLE IF EXISTS "Message";
DROP TABLE IF EXISTS "Conversation";

-- Remove Phase 9 embedding columns
ALTER TABLE "Note"     DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "Document" DROP COLUMN IF EXISTS "embedding";
ALTER TABLE "Bookmark" DROP COLUMN IF EXISTS "embedding";
