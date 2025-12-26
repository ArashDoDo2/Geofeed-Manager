-- CreateTable
CREATE TABLE "GeofeedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IpRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "geofeedId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "subdivision" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IpRange_geofeedId_fkey" FOREIGN KEY ("geofeedId") REFERENCES "GeofeedFile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GeofeedFile_userId_idx" ON "GeofeedFile"("userId");

-- CreateIndex
CREATE INDEX "IpRange_geofeedId_idx" ON "IpRange"("geofeedId");

-- CreateIndex
CREATE INDEX "IpRange_userId_idx" ON "IpRange"("userId");
