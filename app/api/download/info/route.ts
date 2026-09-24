// app/api/download/info/route.ts
import { NextRequest, NextResponse } from "next/server"
import { validateToken } from "@/lib/tokens"

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token")
  if (!token) return NextResponse.json({ valid: false }, { status: 400 })

  const result = await validateToken(token)
  if (!result) {
    return NextResponse.json(
      { valid: false, message: "This link has expired or already been used." },
      { status: 410 }
    )
  }

  return NextResponse.json({
    valid: true,
    templateTitle: result.template?.title ?? "Your Template",
  })
}