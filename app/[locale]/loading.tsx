export default function HomeLoading() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">

            {/* Left: Sidebar skeleton */}
            <aside className="w-64 shrink-0 flex flex-col h-full border-r bg-white">
                {/* Header */}
                <div className="p-4 border-b space-y-3">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Artist list */}
                <nav className="flex-1 p-2 space-y-1">
                    {/* All artworks button */}
                    <div className="h-9 w-full bg-gray-200 rounded-md animate-pulse" />
                    <div className="my-2 border-t" />
                    {/* Artist rows */}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 w-full bg-gray-100 rounded-md animate-pulse" />
                    ))}
                </nav>

                {/* Footer: language toggle */}
                <div className="p-3 border-t flex justify-end">
                    <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </aside>

            {/* Right: Main content skeleton */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">

                {/* Header skeleton */}
                <div className="flex items-center gap-3 border-b bg-white px-6 py-4 shrink-0">
                    <div className="h-8 flex-1 max-w-md bg-gray-200 rounded-md animate-pulse" />
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-14 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-14 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-14 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
                        <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                </div>

                {/* Artwork grid skeleton */}
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 content-start">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                                {/* Image placeholder */}
                                <div className="h-48 w-full bg-gray-200 animate-pulse" />
                                {/* Card content */}
                                <div className="p-4 space-y-2">
                                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}