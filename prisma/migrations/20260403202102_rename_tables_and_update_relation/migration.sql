/*
  Warnings:

  - You are about to drop the `Artist` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Artwork` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Artwork" DROP CONSTRAINT "Artwork_artistId_fkey";

-- DropTable
DROP TABLE "Artist";

-- DropTable
DROP TABLE "Artwork";

-- CreateTable
CREATE TABLE "artworks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artistId" INTEGER NOT NULL,
    "medium" TEXT,
    "dimensions" JSONB,
    "year" TEXT NOT NULL,
    "mainImageUrl" TEXT,
    "additionalImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certificationUrl" TEXT NOT NULL,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'IN_HOME',
    "location" TEXT,
    "purchasePrice" DECIMAL(65,30),
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
