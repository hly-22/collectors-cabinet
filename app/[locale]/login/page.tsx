'use client'

import { useRouter } from "@/i18n/navigation";
import { loginWithEmail } from "@/lib/auth/auth";
import { useState } from "react";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleEmailLogin = async () => {
        setError("");
        try {
            await loginWithEmail(email, password);
            router.push('/');
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-md space-y-4 mx-5">
                <h1 className="text-2xl font-semibold text-center">Manager Login</h1>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                />

                <button
                    onClick={handleEmailLogin}
                    className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-700"
                >
                    Login
                </button>
            </div>
        </div>
    )
}