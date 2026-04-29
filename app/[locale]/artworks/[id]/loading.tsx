export default function ArtworkLoading() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid gap-8 md:grid-cols-[2fr_3fr] items-start">
                {/* Left: image skeleton */}
                <div className="space-y-4">
                    <div className="aspect-4/3 w-full rounded-lg bg-gray-200 animate-pulse" />
                </div>

                {/* Right: details skeleton */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-1">
                                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}