"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

type DeleteArtworkButtonProps = {
    id: string;
    title: string;
};

export default function DeleteArtworkButton({ id, title }: DeleteArtworkButtonProps) {

    const t = useTranslations();

    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);

    async function handleDelete() {
        setPending(true);
        setError(null);

        try {
            const res = await fetch(`/api/artworks/${id}`, { method: "DELETE" });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || "Failed to remove artwork.");
            }

            sessionStorage.setItem("artwork-toast", `${title} has been removed.`);
            setShowDialog(false);
            router.push('/');
            router.refresh();
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Unexpected error.");
        } finally {
            setPending(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                className="rounded-md border border-red-200 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                onClick={() => setShowDialog(true)}
            >
                {t("actions.delete")}
            </button>
            {error && <p className="text-xs text-red-600">{error}</p>}

            {showDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => (!pending ? setShowDialog(false) : null)}
                    />
                    <div
                        className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-artwork-title"
                    >
                        <h2
                            id="delete-artwork-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            {t("actions.deleteConfirmTitle", { title })}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {t("actions.secondDeleteConfirmMessage")}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:bg-gray-100"
                                onClick={() => setShowDialog(false)}
                                disabled={pending}
                            >
                                {t("actions.cancel")}
                            </button>
                            <button
                                type="button"
                                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                onClick={handleDelete}
                                disabled={pending}
                            >
                                {pending ? t("actions.deleting") : t("actions.delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}