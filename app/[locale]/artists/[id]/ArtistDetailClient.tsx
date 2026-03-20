"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

type Artist = {
    id: number;
    name: string;
    description: string | null;
};

type Artwork = {
    id: number;
    title: string;
    year: string;
};

type ArtistDetailClientProps = {
    artist: Artist;
    artworks: Artwork[];
};

export default function ArtistDetailClient({ artist, artworks }: ArtistDetailClientProps) {

    const t = useTranslations();

    const router = useRouter();

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(artist.name);
    const [description, setDescription] = useState(artist.description ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Optimistic UI
    const [displayName, setDisplayName] = useState(artist.name);
    const [displayDescription, setDisplayDescription] = useState(artist.description);

    // Delete state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleSave() {
        setEditError(null);
        setIsSaving(true);

        try {
            const res = await fetch(`/api/artists/${artist.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setEditError(data?.error || t("error.updateArtist"));
                return;
            }

            setDisplayName(name.trim());
            setDisplayDescription(description.trim() || null);
            setIsEditing(false);
        } catch {
            setEditError(t("error.tryAgain"));
        } finally {
            setIsSaving(false);
        }
    }

    function handleCancel() {
        setName(displayName);
        setDescription(displayDescription ?? "");
        setEditError(null);
        setIsEditing(false);
    }

    async function handleDelete() {
        setDeleteError(null);
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/artists/${artist.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setDeleteError(data?.error || t("error.deleteArtist"));
                setIsDeleting(false);
                return;
            }

            const artworkCount = artworks.length;
            const toastMessage = artworkCount === 0
                ? t("toast.artistDeleted", { name: artist.name })
                : t("toast.artistDeletedWithArtworks", { name: artist.name, count: artworkCount });

            window.sessionStorage.setItem("artwork-toast", toastMessage);
            router.push("/");
            router.refresh();
        } catch {
            setDeleteError(t("error.tryAgain"));
            setIsDeleting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Back link */}
            <div className="mb-6">
                <Link
                    href="/"
                    className="text-sm text-blue-600 hover:underline">
                    {t("nav.backToArtworks")}
                </Link>
            </div>

            {/* Artist Info */}
            <div className="rounded-lg border bg-white p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <h1 className="text-2xl font-semibold">
                        {isEditing ? (
                            <input
                                className="w-full rounded border px-3 py-1.5 text-xl font-semibold focus:outline-none focus:ring-1 focus:ring-gray-300"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        ) : (
                            displayName
                        )}
                    </h1>

                    {/* Edit/Save/Cancel button */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving || !name.trim()}
                                    className="rounded-md bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                >
                                    {isSaving ? t("actions.saving") : t("actions.saveChanges")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="rounded-md border px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t("actions.cancel")}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-md border px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t("actions.edit")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="rounded-md border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    {t("actions.delete")}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {editError && (
                    <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {editError}
                    </div>
                )}

                {/* Description */}
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wide text-gray-400">
                        {t("artist.description")}
                    </label>
                    {isEditing ? (
                        <textarea
                            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("wizard.artistDescriptionPlaceholder")}
                        />
                    ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-line">
                            {displayDescription || (
                                <span className="text-gray-400">{t("artist.noDescription")}</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Artworks */}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wide text-gray-400">
                        {t("artist.artworks")} ({artworks.length})
                    </label>
                    {artworks.length === 0 ? (
                        <p className="text-sm text-gray-400">{t("artist.noArtworks")}</p>
                    ) : (
                        <ul className="space-y-1">
                            {artworks.map((artwork) => (
                                <li key={artwork.id}>
                                    <Link
                                        href={{
                                            pathname: '/artworks/[id]',
                                            params: { id: artwork.id }
                                        }}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        {artwork.title} ({artwork.year})
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
                        <h2 className="text-lg font-semibold">
                            {t.rich("actions.deleteConfirmName", {
                                name: artist.name,
                                i: (chunks) => <span className="italic">{chunks}</span>
                            })}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {t("actions.firstDeleteConfirmMessage")}
                        </p>
                        <p className="text-sm text-gray-600">{t("actions.secondDeleteConfirmMessage")}</p>

                        {deleteError && (
                            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteError(null);
                                }}
                                disabled={isDeleting}
                                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                {t("actions.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isDeleting ? t("actions.deleting") : t("actions.confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}