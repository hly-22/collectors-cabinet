'use client'

import { useRouter } from "@/i18n/navigation"
import { logout } from "@/lib/auth/auth";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push({
            pathname: '/'
        });
    }

    return (
        <button onClick={handleLogout} className="px-4 py-2 text-sm font-light hover:underline transition-colors">
            Logout
        </button>
    )
}