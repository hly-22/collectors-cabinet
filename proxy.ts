import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/proxy";

const handleI18nRouting = createMiddleware(routing);

export async function proxy(request: NextRequest) {

    // 1. Refresh Supabase session
    const supabaseResponse = await updateSession(request);

    // 2. If updateSession returned a redirect, respect it
    // Currently no use but keeping for future
    if (!supabaseResponse.ok) {
        return supabaseResponse;
    }

    // 3. Run next-intl routing
    const intlResponse = handleI18nRouting(request);

    // 4. Copy Supabase cookies onto intl response so they aren't lost
    supabaseResponse.cookies.getAll().forEach(cookie => {
        intlResponse.cookies.set(cookie);
    })

    return intlResponse;
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};