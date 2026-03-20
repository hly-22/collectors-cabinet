import prisma from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import DeleteArtworkButton from "./DeleteArtworkButton";
import AdditionalImagesGallery from "./AdditionalImagesGallery";
import MainImageDisplay from "./MainImageDisplay";
import { getTranslations, setRequestLocale } from "next-intl/server";

type ArtworkPageProps = {
    params: Promise<{ id: string, locale: string }>;
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {

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
    })

    if (!artwork) notFound();

    const dimensions = artwork.dimensions as
        | { width?: number; height?: number; unit?: string }
        | null;

    const dimensionsText = dimensions &&
        typeof dimensions.width === "number" &&
        typeof dimensions.height === "number" &&
        typeof dimensions.unit === "string"
        ? `${dimensions.width}${dimensions.unit} x ${dimensions.height}${dimensions.unit}`
        : "-";

    function formatWithThousands(intPart: string) {
        return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function formatCurrencyByCode(value: string, currency: string) {
        const hasDot = value.includes(".");
        const [rawInt, rawFrac = ""] = hasDot ? value.split(".") : [value, ""];
        const isVND = currency === "VND";
        const decimals = isVND ? 0 : 2;

        const cleanedInt = rawInt.replace(/[^0-9]/g, "");
        const cleanedFrac = rawFrac.replace(/[^0-9]/g, "");

        const intPart = cleanedInt.length ? cleanedInt : "0";
        const intWithSep = formatWithThousands(intPart);

        if (decimals === 0) {
            return `${currency} ${intWithSep}`;
        }

        const fracPadded = (cleanedFrac + "00").slice(0, decimals);
        return `${currency} ${intWithSep}.${fracPadded}`;
    }

    const priceText = artwork.purchasePrice
        ? formatCurrencyByCode(artwork.purchasePrice.toString(), artwork.currency)
        : "-";

    const statusLabel = t(`status.${artwork.status}`);

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Breadcrumb / back link */}
            <div className="flex mb-4">
                <Link
                    href="/"
                    className="text-sm text-blue-600 hover:underline"
                >
                    {t("nav.backToArtworks")}
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-[2fr_3fr] items-start">
                {/* Left: main image + additional images */}
                <div className="space-y-4">
                    {artwork.mainImageUrl ? (
                        <MainImageDisplay
                            src={artwork.mainImageUrl}
                            alt={artwork.title}
                            width={1600}
                            height={1200}
                            className="w-full rounded-lg border object-cover"
                        />
                    ) : (
                        <div className="aspect-4/3 w-full rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400">
                            {t("artwork.noImage")}
                        </div>
                    )}

                    {artwork.additionalImageUrls.length > 0 && (
                        <AdditionalImagesGallery
                            images={artwork.additionalImageUrls}
                            title={artwork.title}
                        />
                    )}
                </div>

                {/* Right: details */}
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold">{artwork.title}</h1>
                            <p className=" text-lg text-gray-700 mb-2">
                                {artwork.artist.name}
                            </p>
                            {artwork.certificationUrl && (
                                <div>
                                    <a
                                        href={artwork.certificationUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                    >
                                        {t("artwork.viewCertification")}
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="hidden md:flex gap-2 items-start">
                            <Link href={{
                                pathname: '/artworks/[id]/edit',
                                params: { id: artwork.id }
                            }}>
                                <button
                                    type="button"
                                    className="rounded-md border px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t("actions.edit")}
                                </button>
                            </Link>
                            <DeleteArtworkButton id={artwork.id} title={artwork.title} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <DetailRow label={t("artwork.year")} value={artwork.year} />
                        <DetailRow label={t("artwork.medium")} value={artwork.medium} />
                        <DetailRow label={t("artwork.dimensions")} value={dimensionsText} />
                        <DetailRow label={t("artwork.status")} value={statusLabel} />
                        <DetailRow label={t("artwork.location")} value={artwork.location ?? "-"} />
                        <DetailRow label={t("artwork.purchasePrice")} value={priceText} />
                    </div>

                    {artwork.notes && (
                        <div className="mt-4">
                            <h2 className="text-sm font-medium mb-1">{t("artwork.notes")}</h2>
                            <p className="whitespace-pre-line text-sm text-gray-800">
                                {artwork.notes}
                            </p>
                        </div>
                    )}

                    <div className="flex md:hidden mt-10 gap-2 ">
                        <Link href={{
                            pathname: '/artworks/[id]/edit',
                            params: { id: artwork.id }
                        }}>
                            <button
                                type="button"
                                className="rounded-md border px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {t("actions.edit")}
                            </button>
                        </Link>
                        <DeleteArtworkButton id={artwork.id} title={artwork.title} />
                    </div>
                </div>
            </div>
        </div>
    )
}

type DetailRowProps = {
    label: string;
    value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
    return (
        <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide text-gray-500">
                {label}
            </span>
            <span className="text-sm text-gray-900">{value}</span>
        </div>
    )
}
