"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import type { routing } from "@/i18n/routing";

type AppPathnames = keyof typeof routing.pathnames;

type LanguageToggleProps = {
    compact?: boolean;  // if true, show flags only (no text)
}

export default function LanguageToggle({ compact = false }: LanguageToggleProps) {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname() as AppPathnames;
    const params = useParams() as Record<string, string>;

    function handleSwitch(newLocale: string) {
        router.replace(
            { pathname, params } as Parameters<typeof router.replace>[0],
            { locale: newLocale }
        );
    }

    return (
        <div className="flex items-center rounded-md border overflow-hidden text-xs font-medium shadow-sm">
            <button
                type="button"
                onClick={() => handleSwitch("en")}
                className={`px-2.5 py-1.5 transition-colors ${locale === "en"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
            >
                {compact ? "🇬🇧" : "🇬🇧 EN"}
            </button>
            <button
                type="button"
                onClick={() => handleSwitch("vi")}
                className={`px-2.5 py-1.5 transition-colors ${locale === "vi"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
            >
                {compact ? "🇻🇳" : "🇻🇳 VI"}
            </button>
        </div>
    )

}