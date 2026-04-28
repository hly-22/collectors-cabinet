import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ArtistDetailClient from "./ArtistDetailClient";
import { createClient } from "@/lib/supabase/server";

type ArtistPageProps = {
    params: Promise<{ id: string }>;
}

export default async function ArtistPage({ params }: ArtistPageProps) {
    const { id } = await params;

    if (!id) notFound();

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const isManager = !!data?.claims;

    const artist = await prisma.artist.findUnique({
        where: { id },
        include: {
            artworks: {
                orderBy: { year: "asc" },
                select: { id: true, title: true, year: true },
            },
        },
    });

    if (!artist) notFound();

    return (
        <ArtistDetailClient
            artist={artist}
            artworks={artist.artworks}
            isManager={isManager}
        />
    )
}