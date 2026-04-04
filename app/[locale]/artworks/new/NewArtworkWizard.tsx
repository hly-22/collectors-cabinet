"use client";

import { useState } from "react";
import NewArtworkForm from "./NewArtworkForm";
import { useTranslations } from "next-intl";

type Artist = {
    id: string;
    name: string;
    description: string | null;
};

type NewArtworkWizardProps = {
    artists: Artist[];
};

export default function NewArtworkWizard({ artists }: NewArtworkWizardProps) {

    const t = useTranslations();

    const [selectedArtistId, setSelectedArtistId] = useState<string>("");
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newArtistName, setNewArtistName] = useState("");
    const [newArtistDescription, setNewArtistDescription] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const sortedArtists = [...artists].sort((a, b) => a.name.localeCompare(b.name));

    function handleCreateArtist(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage(null);

        const name = newArtistName.trim();
        const description = newArtistDescription.trim();
        if (!name) {
            setErrorMessage(t("error.nameRequired"));
            return;
        }

        // Create a local draft artist (id < 0 sentinel) and proceed.
        const draft: Artist = {
            id: "",
            name,
            description: description || null
        };
        setSelectedArtist(draft);
        // Keep inputs as-is so user can go back and edit if needed.
    }

    if (selectedArtist) {
        return (
            <NewArtworkForm
                artist={selectedArtist}
                onChangeArtist={() => {
                    setSelectedArtist(null);
                    setSelectedArtistId("");
                }}
            />
        );
    }

    return (
        <div className="space-y-6 border rounded-lg p-6">
            {errorMessage && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <div className="space-y-2">
                <h2 className="font-bold text-lg">
                    {t("wizard.selectOrAdd")}
                </h2>
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium">{t("wizard.existingArtists")}</label>
                <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={selectedArtistId}
                    onChange={(e) => setSelectedArtistId(e.target.value)}
                >
                    <option value="">{t("wizard.selectArtist")}</option>
                    {sortedArtists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                            {artist.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    disabled={!selectedArtistId}
                    onClick={() => {
                        const artist = sortedArtists.find(
                            (a) => a.id === selectedArtistId,
                        );
                        if (artist) {
                            setSelectedArtist(artist);
                        }
                    }}
                >
                    {t("wizard.continueToForm")}
                </button>
            </div>

            <div className="border-t pt-6">
                <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:underline"
                    onClick={() => setShowCreate((prev) => !prev)}
                >
                    {showCreate ? t("wizard.hideNewArtist") : t("wizard.addNewArtist")}                </button>

                {showCreate && (
                    <form onSubmit={handleCreateArtist} className="mt-4 space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">{t("wizard.artistName")}</label>
                                {newArtistName && (
                                    <button
                                        type="button"
                                        className="text-xs hover:underline cursor-pointer"
                                        onClick={() => { setNewArtistName("") }}
                                    >
                                        {t("actions.clear")}
                                    </button>
                                )}
                            </div>
                            <input
                                className="w-full rounded border px-3 py-2 text-sm"
                                value={newArtistName}
                                onChange={(e) => setNewArtistName(e.target.value)}
                                placeholder={t("wizard.artistNamePlaceholder")}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium">{t("wizard.artistDescription")}</label>
                                {newArtistDescription && (
                                    <button
                                        type="button"
                                        className="text-xs hover:underline cursor-pointer"
                                        onClick={() => { setNewArtistDescription("") }}
                                    >
                                        {t("actions.clear")}
                                    </button>
                                )}
                            </div>
                            <textarea
                                className="w-full rounded border px-3 py-2 text-sm"
                                rows={3}
                                value={newArtistDescription}
                                onChange={(e) => setNewArtistDescription(e.target.value)}
                                placeholder={t("wizard.artistDescriptionPlaceholder")}
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            disabled={!newArtistName.trim()}
                        >
                            {t("wizard.continueToForm")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
