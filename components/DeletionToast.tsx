"use client";

import { useEffect, useState } from "react";

export default function DeletionToast() {
    const [message, setMessage] = useState<string | null>(() => {
        if (typeof window === "undefined") return null;
        return window.sessionStorage.getItem("artwork-toast");
    });

    useEffect(() => {
        if (!message) return;

        window.sessionStorage.removeItem("artwork-toast");
        const timer = window.setTimeout(() => setMessage(null), 4000);
        return () => window.clearTimeout(timer);
    }, [message]);

    if (!message) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black px-4 py-3 text-sm text-white shadow-lg">
            {message}
        </div>
    );
}