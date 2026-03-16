import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["en", "vi"],
    defaultLocale: "vi",
    pathnames: {
        '/': '/',
        '/artworks/[id]': {
            vi: '/tac-pham/[id]'
        },
        '/artworks/new': {
            vi: '/them-tac-pham'
        },
        '/artworks/[id]/edit': {
            vi: '/tac-pham/[id]/chinh-sua'
        },
        '/artists/[id]': {
            vi: '/nghe-si/[id]'
        },
        '/artists/[id]/edit': {
            vi: '/nghe-si/[id]/chinh-sua'
        },
    }
})