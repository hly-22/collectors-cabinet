export default function ArtistLoading() {
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="rounded-lg border bg-white p-6 space-y-6">
                {/* Name + buttons */}
                <div className="flex items-start justify-between">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="flex gap-2">
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
                {/* Description */}
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                </div>
                {/* Artwork count */}
                <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                {/* Artwork list */}
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}