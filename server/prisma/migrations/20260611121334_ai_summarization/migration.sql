-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "fileSize" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fileType" TEXT NOT NULL DEFAULT 'application/octet-stream';
