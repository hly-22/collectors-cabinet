'use client'

import { Link, useRouter } from "@/i18n/navigation";
import { logout } from "@/lib/auth/auth";
import { useTranslations } from "next-intl";
import LanguageToggle from "./LanguageToggle";

type HeaderActionsProps = {
    isManager: boolean;
}

export default function HeaderActions({ isManager }: HeaderActionsProps) {

    const router = useRouter();
    const t = useTranslations();

    const handleLogout = async () => {
        await logout();
        router.push({ pathname: '/' });
        router.refresh();
    }

    return (
        <div className="flex items-center gap-5">
            {isManager ? (
                <button
                    onClick={handleLogout}
                    className="text-sm font-light hover:underline transition-colors"
                >
                    {t("nav.logout")}
                </button>
            ) : (
                <Link
                    href="/login"
                    className="text-sm font-light hover:underline transition-colors"
                >
                    {t("nav.login")}
                </Link>
            )}
            <LanguageToggle />
        </div>
    )
}
