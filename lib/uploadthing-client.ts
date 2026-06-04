// src/lib/uploadthing-client.ts
// Client-side helper to get signed URLs for UploadThing images

const UPLOADTHING_APP_ID = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID

export function getUploadThingUrl(fileKey: string): string {
  if (!fileKey) return "/placeholder.png"
  if (fileKey.startsWith("http")) return fileKey
  return `https://utfs.io/f/${fileKey}`
}

// For private files, you'll need server-side signed URLs
// This is a placeholder for the server-side version
export async function getSignedImageUrl(fileKey: string): Promise<string> {
  if (!fileKey) return "/placeholder.png"
  
  // If it's already a full URL, return it
  if (fileKey.startsWith("http")) return fileKey
  
  // For public files on UploadThing, this pattern works
  return `https://utfs.io/f/${fileKey}`
}