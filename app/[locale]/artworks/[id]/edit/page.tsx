import prisma from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import EditArtworkForm from "./EditArtworkForm";
import { getTranslations, setRequestLocale } from "next-intl/server";

type EditArtworkPageProps = {
    params: Promise<{ id: string, locale: string }>;
}

export default async function EditArtworkPage({ params }: EditArtworkPageProps) {

    const { id, locale } = await params;

    setRequestLocale(locale);
    const t = await getTranslations();

    const artworkId = Number(id);

    if (Number.isNaN(artworkId)) {
        notFound();
    }

    const artwork = await prisma.artwork.findUnique({
        where: { id: artworkId },
        include: { artist: true },
    });

    if (!artwork) notFound();

    // Normalize artwork
    const dimensions = artwork.dimensions as { width?: number; height?: number; unit?: string } | null;

    const formArtwork = {
        id: artwork.id,
        title: artwork.title,
        medium: artwork.medium,
        year: artwork.year ?? "",
        mainImageUrl: artwork.mainImageUrl ?? null,
        additionalImageUrls: artwork.additionalImageUrls as string[],
        certificationUrl: artwork.certificationUrl ?? null,
        dimensions: dimensions ?? null,
        status: artwork.status,
        location: artwork.location ?? null,
        purchasePrice: artwork.purchasePrice?.toString() ?? null,
        currency: artwork.currency ?? "VND",
        notes: artwork.notes ?? null,
        artist: {
            id: artwork.artist.id,
            name: artwork.artist.name,
            description: artwork.artist.description ?? null,
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href={{
                        pathname: '/artworks/[id]',
                        params: { id: artwork.id }
                    }}
                    className="text-sm text-blue-600 hover:underline"
                >
                    {t("nav.backToArtworks")}
                </Link>
                {/* Edit Artwork Form here */}
                <EditArtworkForm artwork={formArtwork} />
            </div>
        </div>
    )
}
