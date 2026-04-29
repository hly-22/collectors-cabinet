import { Link } from "@/i18n/navigation";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b bg-white px-4 py-3 flex items-center justify-between">
            <Link
                href="/"
                className="text-sm font-semibold tracking-widest uppercase text-gray-800 hover:to-gray-600 transition-colors"
            >
                Collector&apos;s Cabinet
            </Link>
            <LanguageToggle />
        </header>
    )
}