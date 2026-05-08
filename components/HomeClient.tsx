"use client";

import DeletionToast from "@/components/DeletionToast";
import { useState } from "react"
import ArtistSideBar from "./ArtistSideBar";
import { Link } from "@/i18n/navigation";
import ArtworkGrid from "./ArtworkGrid";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";

type Artist = {
    id: string,
    name: string,
    description: string | null,
    artworkCount: number,
}

type Artwork = {
    id: string,
    title: string,
    year: string,
    mainImageUrl: string | null,
    status: string,
    location: string | null,
    purchasePrice: string | null,
    artist: {
        id: string,
        name: string,
    },
}

type HomeClientProps = {
    artists: Artist[],
    artworks: Artwork[],
    isManager: boolean,
}

type SortField = "title" | "year" | "price" | null;
type SortDirection = "asc" | "desc";

export default function HomeClient({ artists, artworks, isManager }: HomeClientProps) {

    const t = useTranslations();

    const STATUS_OPTIONS = [
        { value: "IN_HOME", label: t("status.IN_HOME") },
        { value: "IN_STORAGE", label: t("status.IN_STORAGE") },
        { value: "IN_EXHIBITION", label: t("status.IN_EXHIBITION") },
        { value: "ON_LOAN", label: t("status.ON_LOAN") },
    ]

    const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleSelectArtist(id: string | null) {
        setSelectedArtistId(id);
        setSearchQuery("");
        setSidebarOpen(false);      // close sidebar on mobile after selecting
    }

    function handleSortClick(field: SortField) {
        if (sortField === field) {
            // Same field: toggle direction, or clear if already desc
            if (sortDirection === "asc") {
                setSortDirection("desc");
            } else {
                setSortField(null);
                setSortDirection("asc");
            }
        } else {
            // New field
            setSortField(field);
            setSortDirection("asc");
        }
    }

    function handleStatusToggle(value: string) {
        setSelectedStatuses((prev) =>
            prev.includes(value)
                ? prev.filter((s) => s !== value)
                : [...prev, value]
        )
    }

    function getSortIcon(field: SortField) {
        if (sortField !== field) return <ArrowUpDown size={13} className="text-gray-400" />;
        return sortDirection === "asc"
            ? <ArrowUp size={13} className="text-gray-100" />
            : <ArrowDown size={13} className="text-gray-100" />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <DeletionToast />

            {/* Mobile sidebar overlay backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)} />
            )}

            {/* Left: Artist Sidebar */}
            <div className={`
                fixed top-13.5 bottom-0 left-0 z-30 transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto lg:inset-y-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}    
            `}>
                <ArtistSideBar
                    artists={artists}
                    totalCount={artworks.length}
                    selectedArtistId={selectedArtistId}
                    onSelect={handleSelectArtist}
                    onClose={() => setSidebarOpen(false)}
                    isManager={isManager}
                />
            </div>

            {/* Right: Artwork Section */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">

                {/* MOBILE HEADER (hidden on desktop) */}
                <header className="lg:hidden flex flex-col bg-white shrink-0">
                    {/* Row 1: hamburger + search */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="shrink-0 rounded-md p-1.5 hover:bg-gray-100 transition-colors"
                            aria-label="Open sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative flex-1">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder={t("nav.searchArtworks")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-md border bg-gray-50 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                            />
                        </div>
                        {isManager && (
                            <Link
                                href="/artworks/new"
                                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                            >
                                + {t("nav.add")}
                            </Link>

                        )}
                    </div>
                    {/* Row 2: status filter + add artwork */}
                    <div className="flex justify-center gap-2 py-2 bg-gray-50">

                        {/* By title */}
                        <button
                            type="button"
                            onClick={() => handleSortClick("title")}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortField === "title"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t("sort.title")} {getSortIcon("title")}
                        </button>
                        {/* By year */}
                        <button
                            type="button"
                            onClick={() => handleSortClick("year")}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortField === "year"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t("sort.year")} {getSortIcon("year")}
                        </button>
                        {/* By price */}
                        {/* <button
                            type="button"
                            onClick={() => handleSortClick("price")}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortField === "price"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t("sort.price")} {getSortIcon("price")}
                        </button> */}

                        {/* Status filter dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setStatusDropdownOpen((prev) => !prev)}
                                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${selectedStatuses.length > 0
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {t("sort.status")}
                                {selectedStatuses.length > 0 && (
                                    <span className="rounded-full bg-white/20 px-1.5 text-xs">
                                        {selectedStatuses.length}
                                    </span>
                                )}
                                <ChevronDown size={13} />
                            </button>

                            {statusDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-md border bg-white shadow-lg">
                                    {STATUS_OPTIONS.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes(option.value)}
                                                onChange={() => handleStatusToggle(option.value)}
                                                className="rounded"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                    {selectedStatuses.length > 0 && (
                                        <>
                                            <div className="border-t">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStatuses([])}
                                                    className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-gray-50"
                                                >
                                                    {t("sort.clearFilter")}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                {/* DESKTOP HEADER (hidden on mobile) */}
                {/* Top bar */}
                <header className="hidden lg:flex items-center justify-between border-b bg-white px-6 py-4 shrink-0">
                    {/* Search bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder={t("nav.searchArtworks")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-md border bg-gray-50 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                    </div>
                    {/* Sort bar */}
                    <div className="flex items-center gap-2">

                        {/* By title */}
                        <button
                            type="button"
                            onClick={() => handleSortClick("title")}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortField === "title"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t("sort.title")} {getSortIcon("title")}
                        </button>
                        {/* By year */}
                        <button
                            type="button"
                            onClick={() => handleSortClick("year")}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortField === "year"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t("sort.year")} {getSortIcon("year")}
                        </button>
                        {/* By price */}
                        {/* <button
                            type="button"
                            onClick={() => handleSortClick("price")}
                            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${sortField === "price"
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {t("sort.price")} {getSortIcon("price")}
                        </button> */}

                        {/* Status filter dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setStatusDropdownOpen((prev) => !prev)}
                                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${selectedStatuses.length > 0
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {t("sort.status")}
                                {selectedStatuses.length > 0 && (
                                    <span className="rounded-full bg-white/20 px-1.5 text-xs">
                                        {selectedStatuses.length}
                                    </span>
                                )}
                                <ChevronDown size={13} />
                            </button>

                            {statusDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-md border bg-white shadow-lg">
                                    {STATUS_OPTIONS.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStatuses.includes(option.value)}
                                                onChange={() => handleStatusToggle(option.value)}
                                                className="rounded"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                    {selectedStatuses.length > 0 && (
                                        <>
                                            <div className="border-t">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStatuses([])}
                                                    className="w-full px-3 py-2 text-left text-xs text-red-500 hover:bg-gray-50"
                                                >
                                                    {t("sort.clearFilter")}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="flex items-center gap-2">
                        {isManager ? (
                            <>
                                <Link
                                    href="/artworks/new"
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                                >
                                    + {t("nav.addArtwork")}
                                </Link>
                            </>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </header>

                {/* Arwork */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <ArtworkGrid
                        artworks={artworks}
                        selectedArtistId={selectedArtistId}
                        searchQuery={searchQuery}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        selectedStatuses={selectedStatuses}
                    />
                </main>
            </div >
        </div >
    )

}