import imageCompression from "browser-image-compression";

export async function compressImageFile(file: File): Promise<File> {
    if (file.type === "application/pdf") return file;

    const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        initialQuality: 0.8,
        useWebWorker: true,
    })

    return new File([compressed], file.name, { type: compressed.type });
}