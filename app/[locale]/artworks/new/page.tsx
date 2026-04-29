import { prisma } from "@/lib/prisma"
import NewArtworkWizard from "./NewArtworkWizard"
import { setRequestLocale } from "next-intl/server";

export default async function NewArtworkPage({ params }: { params: Promise<{ locale: string }> }) {

    const { locale } = await params;
    setRequestLocale(locale);

    const artists = await prisma.artist.findMany({
        orderBy: { name: 'asc' },
    })

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <NewArtworkWizard artists={artists} />
        </div>
    )
}
