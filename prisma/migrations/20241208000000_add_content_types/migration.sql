-- CreateEnum for FieldType
-- Note: SQLite doesn't support ENUMs, so we'll use TEXT with CHECK constraints

-- CreateTable ContentType
CREATE TABLE "ContentType" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT,
  "slug" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "ContentType_name_key" ON "ContentType"("name");
CREATE UNIQUE INDEX "ContentType_slug_key" ON "ContentType"("slug");
CREATE INDEX "ContentType_slug_idx" ON "ContentType"("slug");

-- CreateTable ContentField
CREATE TABLE "ContentField" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "fieldType" TEXT NOT NULL CHECK ("fieldType" IN ('TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'DATE', 'EMAIL', 'URL', 'JSON', 'RELATION', 'MEDIA')),
  "required" BOOLEAN NOT NULL DEFAULT false,
  "unique" BOOLEAN NOT NULL DEFAULT false,
  "defaultValue" TEXT,
  "options" TEXT,
  "relatedType" TEXT,
  "contentTypeId" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentField_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "ContentType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContentField_contentTypeId_name_key" ON "ContentField"("contentTypeId", "name");
CREATE INDEX "ContentField_contentTypeId_idx" ON "ContentField"("contentTypeId");

-- CreateTable ContentEntry
CREATE TABLE "ContentEntry" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "contentTypeId" TEXT NOT NULL,
  "slug" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentEntry_contentTypeId_fkey" FOREIGN KEY ("contentTypeId") REFERENCES "ContentType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContentEntry_contentTypeId_slug_key" ON "ContentEntry"("contentTypeId", "slug");
CREATE INDEX "ContentEntry_contentTypeId_idx" ON "ContentEntry"("contentTypeId");

-- CreateTable ContentFieldValue
CREATE TABLE "ContentFieldValue" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fieldId" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "value" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ContentField" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ContentFieldValue_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ContentFieldValue_fieldId_entryId_key" ON "ContentFieldValue"("fieldId", "entryId");
CREATE INDEX "ContentFieldValue_entryId_idx" ON "ContentFieldValue"("entryId");
CREATE INDEX "ContentFieldValue_fieldId_idx" ON "ContentFieldValue"("fieldId");