/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `menu_items` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `menu_items` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to drop the column `title` on the `specials` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `specials` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - Added the required column `name` to the `events` table without a default value. This is not possible if the table is not empty.
  - Made the column `endDate` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `endDate` to the `specials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `specials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `specials` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "menu_categories_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_events" ("createdAt", "description", "endDate", "id", "siteId", "startDate", "updatedAt", "name") SELECT "createdAt", "description", COALESCE("endDate", "startDate"), "id", "siteId", "startDate", "updatedAt", COALESCE("title", "Event") FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE TABLE "new_menu_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "allergens" TEXT NOT NULL DEFAULT '[]',
    "calories" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "menu_items_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_menu_items" ("allergens", "calories", "category", "createdAt", "description", "id", "isAvailable", "name", "price", "siteId", "source", "updatedAt") SELECT "allergens", "calories", "category", "createdAt", "description", "id", "isAvailable", "name", "price", "siteId", "source", "updatedAt" FROM "menu_items";
DROP TABLE "menu_items";
ALTER TABLE "new_menu_items" RENAME TO "menu_items";
CREATE TABLE "new_specials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL,
    "originalPrice" REAL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "specials_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_specials" ("createdAt", "description", "id", "isActive", "price", "siteId", "updatedAt", "name", "startDate", "endDate") SELECT "createdAt", "description", "id", "isActive", CAST("price" AS REAL), "siteId", "updatedAt", COALESCE("title", "Special"), "createdAt", "createdAt" FROM "specials";
DROP TABLE "specials";
ALTER TABLE "new_specials" RENAME TO "specials";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
