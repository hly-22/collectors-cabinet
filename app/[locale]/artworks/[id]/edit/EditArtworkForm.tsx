"use client";

import ArtworkForm, { Artist, ArtworkFormValues } from "@/components/ArtworkForm";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { compressImageFile } from "@/lib/compress-img";

type Dimensions = {
    width?: number,
    height?: number,
    unit?: string,
}

type Artwork = {
    id: string,
    title: string,
    medium: string | null,
    year: string,
    description: string | null,
    mainImageUrl: string | null,
    additionalImageUrls: string[],
    certificationUrl: string | null,
    dimensions: Dimensions | null,
    status: string,
    location: string | null,
    purchasePrice: string | null,
    currency: string,
    notes: string | null,
    artist: Artist,
};

type EditArtworkFormProps = {
    artwork: Artwork;
}

export default function EditArtworkForm({ artwork }: EditArtworkFormProps) {

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

    function normalizePriceInputForAPI(input: string, currency: string): string | null {
        const trimmed = input.trim();
        if (!trimmed) return null;

        const raw = trimmed.replace(/[^0-9.,]/g, "");
        if (!raw) return null;

        let lastSepIndex = -1;
        for (let i = raw.length - 1; i >= 0; i--) {
            const ch = raw[i];
            if (ch === "." || ch === ",") {
                lastSepIndex = i;
                break;
            }
        }

        let intPart = "";
        let fracPart = "";
        if (lastSepIndex >= 0) {
            intPart = raw.slice(0, lastSepIndex).replace(/[^0-9]/g, "");
            fracPart = raw.slice(lastSepIndex + 1).replace(/[^0-9]/g, "");
        } else {
            intPart = raw.replace(/[^0-9]/g, "");
        }

        if (!intPart) intPart = "0";
        if (currency === "VND") return intPart;
        if (!fracPart) return intPart;
        return `${intPart}.${fracPart}`;
    }

    async function handleSubmit(values: ArtworkFormValues) {
        setErrorMessage(null);
        setIsSubmitting(true);

        try {

            // Main image: null if removed, new upload if file picked, existing url otherwise
            let finalMainImageUrl: string | null = values.removeMainImage
                ? null
                : values.existingMainImageUrl || null;

            if (!values.removeMainImage && values.mainImageFile) {
                try {
                    finalMainImageUrl = await uploadFile(values.mainImageFile);
                } catch (err) {
                    console.error("Upload new main image failed", err);
                    setErrorMessage(t("error.mainImage"));
                    return;
                }
            }

            // Certification: same pattern
            let finalCertUrl: string | null = values.removeCertification
                ? null
                : values.existingCertificationUrl || null;

            if (!values.removeCertification && values.certificationFile) {
                try {
                    finalCertUrl = await uploadFile(values.certificationFile);
                } catch {
                    setErrorMessage(t("error.certification"));
                    return;
                }
            }

            // Additional images: keep existing + upload new
            let uploadedNewUrls: string[] = [];
            if (values.newAdditionalFiles.length > 0) {
                try {
                    uploadedNewUrls = await Promise.all(
                        values.newAdditionalFiles.map((file) => uploadFile(file))
                    );
                } catch {
                    setErrorMessage(t("error.additionalImages"));
                    return;
                }
            }

            const finalAdditionalUrls = [
                ...values.existingAdditionalUrls,
                ...uploadedNewUrls,
            ];

            // Dimensions handling
            const dimensions =
                values.width && values.height
                    ? { width: Number(values.width), height: Number(values.height), unit: values.unit }
                    : {};

            const payload = {
                title: values.title,
                medium: values.medium,
                year: values.year,
                description: values.description || null,
                mainImageUrl: finalMainImageUrl,
                certificationUrl: finalCertUrl,
                additionalImageUrls: finalAdditionalUrls,
                dimensions,
                status: values.status,
                location: values.location || null,
                purchasePrice: normalizePriceInputForAPI(values.purchasePrice, values.currency),
                currency: values.currency,
                notes: values.notes || null,
            };

            const res = await fetch(`/api/artworks/${artwork.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setErrorMessage(data?.error || t("error.updateArtwork"));
                return;
            }

            router.push({
                pathname: '/artworks/[id]',
                params: { id: artwork.id }
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            setErrorMessage(t("error.tryAgain"));
            setIsSubmitting(false);
        }
    }

    const dimensions = artwork.dimensions;

    return (
        <ArtworkForm
            artist={artwork.artist}
            initialData={{
                title: artwork.title,
                medium: artwork.medium ?? "",
                year: artwork.year,
                description: artwork.description ?? "",
                width: dimensions?.width?.toString() ?? "",
                height: dimensions?.height?.toString() ?? "",
                unit: (dimensions?.unit as "cm" | "in") ?? "cm",
                mainImageUrl: artwork.mainImageUrl ?? "",
                certificationUrl: artwork.certificationUrl ?? "",
                additionalImageUrls: artwork.additionalImageUrls,
                status: artwork.status,
                location: artwork.location ?? "",
                purchasePrice: artwork.purchasePrice?.toString() ?? "",
                currency: artwork.currency ?? "USD",
                notes: artwork.notes ?? "",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={t("actions.saveChanges")}
            errorMessage={errorMessage}
        />
    );
}