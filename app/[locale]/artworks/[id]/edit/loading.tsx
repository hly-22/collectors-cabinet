import { Spinner } from "@/components/ui/spinner";

export default function EditArtworkLoading() {
    return (
        <div className="flex h-screen items-center justify-center">
            <Spinner className="size-10" />
        </div>
    )
}