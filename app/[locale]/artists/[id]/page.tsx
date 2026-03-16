import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArtistDetailClient from "./ArtistDetailClient";

type ArtistPageProps = {
    params: Promise<{ id: string }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
    const { id } = await params;
    const artistId = Number(id);

    if (Number.isNaN(artistId)) notFound();

    const artist = await prisma.artist.findUnique({
        where: { id: artistId },
        include: {
            artworks: {
                orderBy: { id: "asc" },
                select: { id: true, title: true, year: true },
            },
        },
    });

    if (!artist) notFound();

    return (
        <ArtistDetailClient
            artist={{
                id: artist.id,
                name: artist.name,
                description: artist.description,
            }}
            artworks={artist.artworks}
        />
    )
}