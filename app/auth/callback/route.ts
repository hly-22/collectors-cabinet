import { createUserIfNotExists } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            if (data.user) {
                await createUserIfNotExists({
                    id: data.user.id,
                    email: data.user.email ?? undefined,
                })
            }
            return NextResponse.redirect(`${origin}${next}`)
        }

    }

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}