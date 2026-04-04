import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

export default cloudinary;

// HELPERS

// Extract public_id from Cloudinary URL
export function extractPublicId(url: string): string {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return "";

    let after = url.slice(uploadIndex + "/upload/".length);

    // Remove version segment if presented
    after = after.replace(/^v\d+\//, "");

    // Remove file extension
    const dotIndex = after.lastIndexOf(".");
    if (dotIndex !== -1) {
        after = after.slice(0, dotIndex);
    }

    return after;
}

// Delete a single asset from Cloudinary, detect if it's raw (PDF) or image
export async function deleteFromCloudinary(url: string) {
    const publicId = extractPublicId(url);
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
        console.error(`Failed to delete Cloudinary asset: ${publicId}`, error);
    }
}