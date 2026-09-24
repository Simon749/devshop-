import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { utapi } from "@/lib/uploadthing-server"

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { files, endpoint } = await req.json()

    // Generate presigned URLs using UTApi directly
    const presignedUrls = await Promise.all(
      files.map(async (file: { name: string; size: number; type: string }) => {
        // For v7, we use generatePresignedURL or similar
        // Actually, let's use the direct upload approach
        const uploadRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-uploadthing-api-key": process.env.UPLOADTHING_TOKEN!,
          },
          body: JSON.stringify({
            files: [{
              name: file.name,
              size: file.size,
              type: file.type,
            }],
          }),
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to get presigned URL from UploadThing")
        }

        const data = await uploadRes.json()
        return data.data[0]
      })
    )

    return NextResponse.json({ data: presignedUrls })
  } catch (error) {
    console.error("Presign error:", error)
    return NextResponse.json(
      { error: "Failed to generate upload URLs" },
      { status: 500 }
    )
  }
}