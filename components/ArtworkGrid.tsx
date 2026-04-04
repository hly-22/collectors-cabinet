"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Artist = {
    id: string,
    name: string,
};

type Artwork = {
    id: string,
    title: string,
    year: string,
    mainImageUrl: string | null,
    status: string,
    location: string | null,
    purchasePrice: string | null,
    artist: Artist,
};

type SortField = "title" | "year" | "price" | null;
type SortDirection = "asc" | "desc";

type ArtworkGridProps = {
    artworks: Artwork[],
    selectedArtistId: string | null,
    searchQuery: string,
    sortField: SortField,
    sortDirection: SortDirection,
    selectedStatuses: string[],

};

export default function ArtworkGrid({
    artworks,
    selectedArtistId,
    searchQuery,
    sortField,
    sortDirection,
    selectedStatuses,
}: ArtworkGridProps) {

    const t = useTranslations();

    const filtered = artworks
        // 1. Filter by artist
        .filter((a) => selectedArtistId === null || a.artist.id === selectedArtistId)
        // 2. Filter by search query
        .filter((a) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                a.title.toLowerCase().includes(q)   // Search by artwork title for now
            );
        })
        // 3. Filter by status
        .filter((a) => {
            if (selectedStatuses.length === 0) return true;
            return selectedStatuses.includes(a.status);
        })

    // 4. Sort
    const sorted = [...filtered].sort((a, b) => {
        if (!sortField) return 0;

        let comparison = 0;
        if (sortField === "title") {
            comparison = a.title.localeCompare(b.title);
        } else if (sortField === "year") {
            comparison = Number(a.year) - Number(b.year);
        } else if (sortField === "price") {
            const priceA = a.purchasePrice ? Number(a.purchasePrice) : -1;
            const priceB = b.purchasePrice ? Number(b.purchasePrice) : -1;
            comparison = priceA - priceB;
        }

        return sortDirection === "asc" ? comparison : -comparison;
    })

    if (sorted.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
                {t("artwork.noArtworks")}
            </div>
        )
    }

    function getStatusStyle(status: string) {
        switch (status) {
            case "IN_HOME": return "bg-green-100 text-green-700";
            case "IN_STORAGE": return "bg-yellow-100 text-yellow-700";
            case "IN_EXHIBITION": return "bg-blue-100 text-blue-700";
            case "ON_LOAN": return "bg-orange-100 text-orange-700";
            default: return "bg-slate-100 bg-slate-700";
        }
    }

    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 content-start">
            {sorted.map((artwork, index) => (
                <Link key={artwork.id} href={{ pathname: '/artworks/[id]', params: { id: artwork.id } }}>
                    <article className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-shadow">
                        {artwork.mainImageUrl ? (
                            <Image
                                src={artwork.mainImageUrl}
                                alt={artwork.title}
                                width={500}
                                height={600}
                                className="h-48 w-full object-cover"
                                loading={index < 6 ? "eager" : "lazy"}
                                priority={index < 3}
                            />
                        ) : (
                            <div className="h-48 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                {t("artwork.noImage")}
                            </div>
                        )}
                        <div className="space-y-2 p-4">
                            <h2>{artwork.title}</h2>
                            <p className="text-sm text-slate-600">
                                {artwork.artist.name} • {artwork.year}
                            </p>
                            <p className="space-x-3">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${getStatusStyle(artwork.status)}`}>
                                    {t(`status.${artwork.status}`)}
                                </span>
                                {artwork.location && (
                                    <span className="text-sm text-slate-500 truncate">
                                        {t("artwork.location")}: {artwork.location}
                                    </span>
                                )}
                            </p>
                        </div>
                    </article>
                </Link>
            ))}
        </div>
    )
}