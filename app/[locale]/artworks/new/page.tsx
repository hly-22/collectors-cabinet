import prisma from "@/lib/prisma"
import { Link } from "@/i18n/navigation"
import NewArtworkWizard from "./NewArtworkWizard"
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function NewArtworkPage({ params }: { params: Promise<{ locale: string }> }) {

    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations();

    const artists = await prisma.artist.findMany({
        orderBy: { name: 'asc' },
    })

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Breadcrumb / back link */}
            <div className="mb-4">
                <Link
                    href="/"
                    className="text-sm text-blue-600 hover:underline"
                >
                    {t("nav.backToArtworks")}
                </Link>
            </div>
            <NewArtworkWizard artists={artists} />
        </div>
    )
}
