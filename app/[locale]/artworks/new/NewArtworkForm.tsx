"use client";

import ArtworkForm, { Artist, ArtworkFormValues } from "@/components/ArtworkForm";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { compressImageFile } from "@/lib/compress-img";

type NewArtworkFormProps = {
    artist: Artist;
    onChangeArtist: () => void;
};

export default function NewArtworkForm({ artist, onChangeArtist }: NewArtworkFormProps) {

    const t = useTranslations();

    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function uploadFile(file: File): Promise<string> {
        const compressed = await compressImageFile(file);

        const formData = new FormData();
        formData.append("file", compressed);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        return data.url;
    }

    function normalizePriceInputForAPI(input: string, currency: string): string | undefined {
        const trimmed = input.trim();
        if (!trimmed) return undefined;

        // Keep only digits, dots, commas
        const raw = trimmed.replace(/[^0-9.,]/g, "");
        if (!raw) return undefined;

        // Determine decimal separator as the last occurrence of either '.' or ','
        let lastSepIndex = -1;
        for (let i = raw.length - 1; i >= 0; i--) {
            const ch = raw[i];
            if (ch === '.' || ch === ',') {
                lastSepIndex = i;
                break;
            }
        }

        let intPart = '';
        let fracPart = '';
        if (lastSepIndex >= 0) {
            intPart = raw.slice(0, lastSepIndex).replace(/[^0-9]/g, '');
            fracPart = raw.slice(lastSepIndex + 1).replace(/[^0-9]/g, '');
        } else {
            intPart = raw.replace(/[^0-9]/g, '');
        }

        if (!intPart) intPart = '0';

        // Currency-specific decimals (USD=2, VND=0)
        const isVND = currency === 'VND';
        if (isVND) {
            // Ignore any fractional part for VND
            return intPart;
        }

        // Default to 2 decimals for non-VND (e.g., USD)
        if (!fracPart) {
            return intPart; // Let API/DB treat as integer amount
        }
        return `${intPart}.${fracPart}`;
    }

    async function handleSubmit(values: ArtworkFormValues) {
        setErrorMessage(null);
        setIsSubmitting(true);

        // // Upload images only at submit time
        // setUploading(true);

        try {

            // Upload main image
            let uploadedMainUrl = values.existingMainImageUrl;
            if (values.mainImageFile) {
                try {
                    uploadedMainUrl = await uploadFile(values.mainImageFile);
                } catch (err) {
                    console.error("Upload main image failed", err);
                    setErrorMessage("Failed to upload main image");
                    return;
                }
            }

            // Upload certification
            let uploadedCertUrl = values.existingCertificationUrl;
            if (values.certificationFile) {
                try {
                    uploadedCertUrl = await uploadFile(values.certificationFile);
                } catch (err) {
                    console.error("Upload certification file failed", err);
                    setErrorMessage("Failed to upload certification file");
                    return;
                }
            }

            // Upload additional images
            let uploadedAdditionalUrls: string[] = [];
            if (values.newAdditionalFiles.length > 0) {
                try {
                    uploadedAdditionalUrls = await Promise.all(
                        values.newAdditionalFiles.map((file) => uploadFile(file))
                    );
                } catch (err) {
                    console.error("Upload additional images failed", err);
                    setErrorMessage("Failed to upload additional images");
                    return;
                }
            }

            // If artist is a local draft (id < 0), create it first
            let artistId = artist.id;
            if (artistId < 0) {
                const res = await fetch("/api/artists", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: artist.name,
                        description: artist.description ?? null,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => null);
                    setErrorMessage(data?.error || "Failed to create artist");
                    return;
                }

                const createdArtist = await res.json();
                artistId = createdArtist.id;

            }

            // Dimensions handling
            const dimensions =
                values.width && values.height
                    ? { width: Number(values.width), height: Number(values.height), unit: values.unit }
                    : {};

            // Construct payload and sent to backend
            const payload = {
                title: values.title,
                artistId,
                medium: values.medium,
                year: values.year,
                mainImageUrl: uploadedMainUrl,
                certificationUrl: uploadedCertUrl,
                dimensions,
                status: values.status,
                location: values.location || undefined,
                purchasePrice: normalizePriceInputForAPI(values.purchasePrice, values.currency),
                currency: values.currency,
                notes: values.notes || undefined,
                additionalImageUrls: uploadedAdditionalUrls,
            };

            const res = await fetch("/api/artworks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                console.error("Create artwork error", data);
                setErrorMessage(data?.error || "Failed to create artwork");
                return;
            }

            const created = await res.json();
            router.push({
                pathname: '/artworks/[id]',
                params: { id: created.id }
            });
        } catch (error) {
            console.error(error);
            setErrorMessage("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <ArtworkForm
            artist={artist}
            onChangeArtist={onChangeArtist}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={t("nav.addArtwork")}
            errorMessage={errorMessage}
        />
    )
}
