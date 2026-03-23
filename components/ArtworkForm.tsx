"use client";

import { CircleX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

export type Artist = {
    id: number,
    name: string,
    description: string | null,
};

export type ArtworkFormValues = {
    title: string,
    medium: string,
    year: string,
    width: string,
    height: string,
    unit: "cm" | "in",
    // For add mode: new files by user
    mainImageFile: File | null,
    certificationFile: File | null,
    newAdditionalFiles: File[],
    // For edit mode: existing Cloudinary URLs
    existingMainImageUrl: string,
    existingCertificationUrl: string,
    existingAdditionalUrls: string[],
    // Flags for edit mode removal
    removeMainImage: boolean,
    removeCertification: boolean,
    status: string,
    location: string,
    purchasePrice: string,
    currency: string,
    notes: string,
};

export type ArtworkFormInitialData = {
    title?: string,
    medium?: string,
    year?: string,
    width?: string,
    height?: string,
    unit?: "cm" | "in",
    mainImageUrl?: string;
    certificationUrl?: string;
    additionalImageUrls?: string[];
    status?: string;
    location?: string;
    purchasePrice?: string;
    currency?: string;
    notes?: string;
};

type ArtworkFormProps = {
    // Artist display
    artist: Artist,
    onChangeArtist?: () => void,    // add mode only

    // Pre-filled values for edit mode
    initialData?: ArtworkFormInitialData,

    // Submit
    onSubmit: (values: ArtworkFormValues) => Promise<void>,
    isSubmitting: boolean,
    submitLabel: string,
    errorMessage: string | null,
};

export default function ArtworkForm({
    artist,
    onChangeArtist,
    initialData,
    onSubmit,
    isSubmitting,
    submitLabel,
    errorMessage,
}: ArtworkFormProps) {

    const t = useTranslations();

    const isEditMode = !!initialData;

    // Text fields - pre-filled in edit mode, empty in add mode
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [medium, setMedium] = useState(initialData?.medium ?? "");
    const [year, setYear] = useState(initialData?.year ?? "");
    const [width, setWidth] = useState(initialData?.width ?? "");
    const [height, setHeight] = useState(initialData?.height ?? "");
    const [unit, setUnit] = useState<"cm" | "in">(initialData?.unit ?? "cm");
    const [status, setStatus] = useState(initialData?.status ?? "IN_HOME");
    const [location, setLocation] = useState(initialData?.location ?? "");
    const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice ?? "");
    const [currency, setCurrency] = useState(initialData?.currency ?? "USD");
    const [notes, setNotes] = useState(initialData?.notes ?? "");

    // Main Image
    const [existingMainImageUrl, setExistingMainImageUrl] = useState(initialData?.mainImageUrl ?? "");
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [removeMainImage, setRemoveMainImage] = useState(false);

    // Certification
    const [existingCertificationUrl, setExistingCertificationUrl] = useState(initialData?.certificationUrl ?? "");
    const [certificationFile, setCertificationFile] = useState<File | null>(null);
    const [removeCertification, setRemoveCertification] = useState(false);

    // Additional Images
    const [existingAdditionalUrls, setExistingAdditionalUrls] = useState<string[]>(initialData?.additionalImageUrls ?? []);
    const [newAdditionalFiles, setNewAdditionalFiles] = useState<File[]>([]);

    const statusOptions = [
        { value: "IN_HOME", label: t("status.IN_HOME") },
        { value: "IN_STORAGE", label: t("status.IN_STORAGE") },
        { value: "IN_EXHIBITION", label: t("status.IN_EXHIBITION") },
        { value: "ON_LOAN", label: t("status.ON_LOAN") },
    ];

    const currencyOptions = [
        { value: "USD", label: "USD" },
        { value: "VND", label: "VND" },
    ];

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSubmit({
            title,
            medium,
            year,
            width,
            height,
            unit,
            mainImageFile,
            certificationFile,
            newAdditionalFiles,
            existingMainImageUrl,
            existingCertificationUrl,
            existingAdditionalUrls,
            removeMainImage,
            removeCertification,
            status,
            location,
            purchasePrice,
            currency,
            notes
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6">

            {/* Prevent body scroll when submitting */}
            {isSubmitting && (
                <style>{`body { overflow: hidden; }`}</style>
            )}

            {/* Loading overlay when submitting */}
            {isSubmitting && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
                    onWheel={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                >
                    <div className="bg-white rounded-xl px-10 py-8 flex flex-col items-center gap-3 shadow-lg">
                        <Spinner className="size-10" />
                        <p className="text-sm font-medium text-gray-700">{t("actions.saving")}</p>
                        <p className="text-xs text-gray-400">{t("actions.savingNote")}</p>
                    </div>
                </div>
            )}

            {/* Artist */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("form.artist")}</label>
                <input
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={artist.name}
                    disabled
                />
                {isEditMode ? (
                    <p className="text-xs text-gray-400">
                        {t("form.artistCannotChange")}
                    </p>
                ) : (
                    onChangeArtist && (
                        <button
                            type="button"
                            className="text-xs font-medium text-blue-600 hover:underline"
                            onClick={onChangeArtist}
                        >
                            {t("form.changeArtist")}
                        </button>
                    )
                )}
            </div>

            {/* Error message */}
            {errorMessage && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {/* Title */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("form.title")}</label>
                <input
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            {/* Medium & Year */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("form.medium")}</label>
                    <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={medium}
                        onChange={(e) => setMedium(e.target.value)}
                        placeholder="Oil on canvas"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("form.year")}</label>
                    <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="1889"
                        required
                    />
                </div>
            </div>
            {/* Dimensions */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("form.dimensions")}</label>
                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        className="w-24 rounded border px-3 py-2 text-sm"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder={t("form.width")}
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                    />
                    x
                    <input
                        className="w-24 rounded border px-3 py-2 text-sm"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder={t("form.height")}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                    />
                    <select
                        className="w-20 rounded border px-3 py-2 text-sm"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value as "cm" | "in")}
                    >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                    </select>
                    <p className="text-xs text-gray-500">
                        {t("form.dimensionsNote")}
                    </p>
                </div>
            </div>

            {/* Certification */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("form.certification")}</label>

                {/* Show existing cert in edit mode */}
                {existingCertificationUrl && !removeCertification && !certificationFile && (
                    <div className="flex items-center gap-2 rounded border px-3 py-2 text-sm bg-gray-50">
                        <a
                            href={existingCertificationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="grow text-blue-600 hover:underline truncate"
                        >
                            {t("form.currentCertification")}
                        </a>
                        <button
                            type="button"
                            aria-label="Remove certification"
                            className="flex-none text-gray-500 hover:text-red-600"
                            onClick={() => {
                                setRemoveCertification(true);
                                setExistingCertificationUrl("");
                            }}
                        >
                            <CircleX />
                        </button>

                    </div>
                )}

                <input
                    type="file"
                    id="cert-file-input"
                    accept="image/*, .pdf"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setCertificationFile(file);
                            setRemoveCertification(false);
                        } else {
                            setCertificationFile(null);
                        }
                        e.target.value = "";
                    }}
                />
                <div className="border rounded flex items-center">
                    <label
                        htmlFor="cert-file-input"
                        className="flex-none cursor-pointer rounded-l bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
                    >
                        {existingCertificationUrl && !removeCertification
                            ? t("form.replaceFile")
                            : t("form.chooseFile")}
                    </label>
                    {certificationFile ? (
                        <>
                            <span className="grow text-sm px-3 py-2">
                                {certificationFile.name}
                            </span>
                            <button
                                type="button"
                                aria-label="Remove File"
                                className="flex-none mx-1 cursor-pointer"
                                onClick={() => setCertificationFile(null)}
                            >
                                <CircleX />
                            </button>
                        </>
                    ) : (
                        <p className="inline-flex text-sm text-gray-500 px-3 py-2">
                            {t("form.acceptedFormatFile")}
                        </p>
                    )}
                </div>
            </div>

            {/* Main image */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("form.mainImage")}</label>

                {/* Show existing main image in edit mode */}
                {existingMainImageUrl && !removeMainImage && !mainImageFile && (
                    <div className="flex items-center gap-2 rounded border px-3 py-2 text-sm bg-gray-50">
                        <a
                            href={existingMainImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="grow text-blue-700 hover:underline truncate"
                        >
                            {t("form.currentMainImage")}
                        </a>
                        <button
                            type="button"
                            aria-label="Remove main image"
                            className="flex-none text-gray-500 hover:text-red-600"
                            onClick={() => {
                                setRemoveMainImage(true);
                                setExistingMainImageUrl("");
                            }}
                        >
                            <CircleX />
                        </button>

                    </div>
                )}

                <input
                    type="file"
                    id="main-image-input"
                    accept="image/*, .heic"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setMainImageFile(file);
                        setRemoveMainImage(false);
                        e.target.value = "";
                    }}
                />
                <div className="border rounded flex items-center">
                    <label
                        htmlFor="main-image-input"
                        className="flex-none cursor-pointer rounded-l bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
                    >
                        {existingMainImageUrl && !removeMainImage
                            ? t("form.replaceImage")
                            : t("form.chooseFile")}
                    </label>
                    {mainImageFile ? (
                        <>
                            <span className="grow text-sm px-3 py-2 truncate">
                                {mainImageFile.name}
                            </span>
                            <button
                                type="button"
                                aria-label="Remove File"
                                className="flex-none mx-1 cursor-pointer"
                                onClick={() => setMainImageFile(null)}
                            >
                                <CircleX />
                            </button>
                        </>
                    ) : (
                        <p className="inline-flex text-sm text-gray-500 px-3 py-2">
                            {t("form.acceptedFormatImage")}
                        </p>
                    )}
                </div>
            </div>

            {/* Additional Images */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">
                    {t("form.additionalImages")}
                </label>

                {/* Existing saved additional images (edit mode) */}
                {existingAdditionalUrls.length > 0 && (
                    <div className="space-y-2 mb-2">
                        {existingAdditionalUrls.map((url, index) => (
                            <div
                                key={url}
                                className="flex items-center rounded border px-3 py-2 text-sm bg-gray-50"
                            >
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="grow text-blue-700 hover:underline truncate"
                                >
                                    {t("form.image", { index: index + 1 })}
                                </a>
                                <button
                                    type="button"
                                    aria-label={`Remove saved image ${index + 1}`}
                                    className="ml-2 text-gray-500 hover:text-red-600"
                                    onClick={() =>
                                        setExistingAdditionalUrls((prev) =>
                                            prev.filter((_, i) => i !== index)
                                        )
                                    }
                                >
                                    <CircleX />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <input
                    id="additional-images-input"
                    type="file"
                    multiple
                    accept="image/*, .heic"
                    className="hidden"
                    onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length === 0) return;
                        setNewAdditionalFiles((prev) => [...prev, ...files]);
                        e.target.value = "";
                    }}
                />
                <div className="border rounded flex">
                    <label
                        htmlFor="additional-images-input"
                        className="cursor-pointer rounded-l bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900"
                    >
                        {isEditMode ? t("form.addMore") : t("form.chooseFiles")}
                    </label>
                    <p className="inline-flex text-sm text-gray-500 px-3 py-2">
                        {t("form.acceptedFormatImage")}
                    </p>
                </div>

                {newAdditionalFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {newAdditionalFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center rounded border px-3 py-2"
                            >
                                <span className="grow text-sm truncate">{file.name}</span>
                                <button
                                    type="button"
                                    aria-label={`Remove ${file.name}`}
                                    className="ml-2 text-gray-500 hover:text-red-600"
                                    onClick={() =>
                                        setNewAdditionalFiles((prev) =>
                                            prev.filter((_, i) => i !== index)
                                        )
                                    }
                                >
                                    <CircleX />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status & Location */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("form.status")}</label>
                    <select
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("form.location")}</label>
                    <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("form.locationPlaceHolder")}
                    />
                </div>
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("form.purchasePrice")}</label>
                    <input
                        className="w-full rounded border px-3 py-2 text-sm"
                        type="text"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        placeholder={
                            currency === "VND"
                                ? "e.g. 1,200,000"
                                : "e.g. 12,000.00 or 12000,00"
                        }
                    />
                </div>
                <div className="space-y-1">
                    <label className="block text-sm font-medium">{t("form.currency")}</label>
                    <select
                        className="w-full rounded border px-3 py-2 text-sm"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        {currencyOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
                <label className="block text-sm font-medium">{t("form.notes")}</label>
                <textarea
                    className="w-full rounded border px-3 py-2 text-sm"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="..."
                />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? t("actions.saving") : submitLabel}
                </button>
            </div>

        </form>
    )

}