-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "menu_items_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_menu_items" ("allergens", "calories", "category", "createdAt", "description", "id", "image", "isAvailable", "name", "price", "siteId", "source", "updatedAt") SELECT "allergens", "calories", "category", "createdAt", "description", "id", "image", "isAvailable", "name", "price", "siteId", "source", "updatedAt" FROM "menu_items";
DROP TABLE "menu_items";
ALTER TABLE "new_menu_items" RENAME TO "menu_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
