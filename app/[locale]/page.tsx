import HomeClient from "@/components/HomeClient";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [artworks, artists] = await Promise.all([
    prisma.artwork.findMany({
      include: { artist: true },
      orderBy: { id: "asc" },
    }),
    prisma.artist.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const artistsWithCount = artists.map((artist) => ({
    ...artist,
    artworkCount: artworks.filter((a) => a.artist.id === artist.id).length,
  }));

  const serializedArtworks = artworks.map((artwork) => ({
    ...artwork,
    purchasePrice: artwork.purchasePrice?.toString() ?? null,
  }))

  return (
    <HomeClient
      artists={artistsWithCount}
      artworks={serializedArtworks}
    />
  )
}