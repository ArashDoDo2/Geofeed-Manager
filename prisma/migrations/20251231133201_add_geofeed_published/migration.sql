-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GeofeedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GeofeedFile" ("createdAt", "id", "isDraft", "name", "updatedAt", "userId") SELECT "createdAt", "id", "isDraft", "name", "updatedAt", "userId" FROM "GeofeedFile";
DROP TABLE "GeofeedFile";
ALTER TABLE "new_GeofeedFile" RENAME TO "GeofeedFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
