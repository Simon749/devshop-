import { UTApi } from "uploadthing/server"

export const utapi = new UTApi({
  token: process.env.UPLOADTHING_TOKEN,
})

export async function getSignedURL(fileKey: string, opts?: { expiresIn?: number }) {
  return utapi.getSignedURL(fileKey, opts)
}

export async function deleteFiles(fileKeys: string[]) {
  return utapi.deleteFiles(fileKeys)
}