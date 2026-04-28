"use client";

import { MoreVertical, Search, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { logout } from "@/lib/auth/auth";

type Artist = {
    id: string,
    name: string,
    description: string | null,
    artworkCount: number,
};

type ArtistSideBarProps = {
    artists: Artist[],
    totalCount: number,
    selectedArtistId: string | null,
    onSelect: (id: string | null) => void,
    onClose?: () => void,   // mobile close button
    isManager: boolean,
};

function ArtistMenu({ artistId }: { artistId: string }) {

    const t = useTranslations();

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative shrink-0 ml-1 ">
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className="rounded p-0.5 hover:bg-white/20 cursor-pointer transition-colors"
                aria-label="Artist options"
            >
                <MoreVertical size={14} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-30 w-32 rounded-md border bg-white shadow-lg text-gray-700">
                    <Link
                        href={{
                            pathname: '/artists/[id]',
                            params: { id: artistId }
                        }}
                        className="block px-3 py-2 text-sm rounded-md hover:bg-gray-50"
                        onClick={() => setOpen(false)}
                    >
                        {t("nav.view")}
                    </Link>
                </div>
            )}
        </div>
    )
}

export default function ArtistSideBar({
    artists,
    totalCount,
    selectedArtistId,
    onSelect,
    onClose,
    isManager,
}: ArtistSideBarProps) {
    const router = useRouter();

    const t = useTranslations();

    const [search, setSearch] = useState("");

    const filtered = artists.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

    const handleLogout = async () => {
        await logout();
        router.push({ pathname: '/' });
    }

    return (
        <aside className="w-64 shrink-0 flex flex-col h-full border-r bg-white">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                        {t("nav.artists")}
                    </h2>
                    {/* Close button on mobile only */}
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="lg:hidden rounded-md p-1 hover:bg-gray-100 transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X size={16} className="text-gray-500" />
                        </button>
                    )}
                </div>
                {/* Search */}
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder={t("nav.searchArtists")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-md border bg-gray-50 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus: ring-gray-300"
                    />
                </div>
            </div>

            {/* Artists List */}
            <nav className="flex-1 overflow-y-auto p-2">
                {/* All Artworks option */}
                <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors
                        ${selectedArtistId === null
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                >
                    <span className="font-medium">{t("nav.allArtworks")}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 
                        ${selectedArtistId === null
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                        {totalCount}
                    </span>
                </button>

                {/* Divider */}
                <div className="my-2 border-t" />

                {/* Artists */}
                {filtered.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-gray-400">{t("nav.noArtistsFound")}</p>
                ) : (
                    filtered.map((artist) => (
                        <div
                            key={artist.id}
                            className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors 
                                ${selectedArtistId === artist.id
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => onSelect(artist.id)}
                                className="flex flex-1 items-center justify-between min-w-0"
                            >
                                <span className="truncate">{artist.name}</span>
                                <span
                                    className={`ml-2 shrink-0 text-xs rounded-full px-2 py-0.5 
                                        ${selectedArtistId === artist.id
                                            ? "bg-white/20 text-white"
                                            : "bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    {artist.artworkCount}
                                </span>
                            </button>
                            <ArtistMenu artistId={artist.id} />
                        </div>
                    ))
                )}
            </nav>
            {/* Footer: manager login/logout */}
            {isManager ? (
                <div className="p-3 flex justify-between items-center">
                    <span className="px-2 font-light italic">Hello, user!</span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-light hover:underline transition-colors"
                    >
                        {t("nav.logout")}
                    </button>
                </div>
            ) : (
                <div className="p-3 flex justify-end">
                    <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-light hover:underline transition-colors"
                    >
                        {t("nav.login")}
                    </Link>
                </div>
            )}
        </aside>
    )
}

