-- CreateEnum
CREATE TYPE "ArtworkStatus" AS ENUM ('IN_HOME', 'IN_STORAGE', 'ON_LOAN', 'IN_EXHIBITION');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'VND');

-- CreateTable
CREATE TABLE "Artwork" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artistId" INTEGER NOT NULL,
    "medium" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "year" TEXT NOT NULL,
    "mainImageUrl" TEXT NOT NULL,
    "additionalImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "certificationUrl" TEXT NOT NULL,
    "status" "ArtworkStatus" NOT NULL DEFAULT 'IN_HOME',
    "location" TEXT,
    "purchasePrice" DECIMAL(65,30),
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Artwork" ADD CONSTRAINT "Artwork_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
