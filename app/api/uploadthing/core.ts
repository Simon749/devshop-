// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@clerk/nextjs/server"

const f = createUploadthing()

const authenticate = async () => {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  
  if (!userId || role !== "admin") {
    throw new UploadThingError("Unauthorized")
  }
  return { userId }
}

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .middleware(authenticate)
    // No onUploadComplete — we handle everything in the form submit
    .onUploadComplete(() => {}),

  zipUploader: f({
    blob: {
      maxFileSize: "32MB",
      maxFileCount: 1,
    },
  })
    .middleware(authenticate)
    .onUploadComplete(() => {}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter