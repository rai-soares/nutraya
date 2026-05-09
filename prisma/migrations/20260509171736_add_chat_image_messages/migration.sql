CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE');

ALTER TABLE "Message"
ADD COLUMN "messageType" "MessageType",
ADD COLUMN "imageUrl" TEXT;

UPDATE "Message"
SET "messageType" = 'TEXT'
WHERE "messageType" IS NULL;

ALTER TABLE "Message"
ALTER COLUMN "messageType" SET NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;
