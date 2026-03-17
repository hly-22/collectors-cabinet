import imageCompression from "browser-image-compression";

export async function compressImageFile(file: File): Promise<File> {
    if (file.type === "application/pdf") return file;

    return await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.8,
        useWebWorker: true,
    })
}