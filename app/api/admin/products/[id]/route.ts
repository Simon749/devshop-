import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

// PATCH — toggle isPublished or update any field
export async function PATCH(req: Request, { params }: Params) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const [updated] = await db
    .update(templates)
    .set(body)
    .where(eq(templates.id, id))
    .returning({ id: templates.id, isPublished: templates.isPublished });

  if (!updated) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, template: updated });
}

// DELETE — soft delete: unpublish only, never destroy (orders reference templates)
export async function DELETE(_req: Request, { params }: Params) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [updated] = await db
    .update(templates)
    .set({ isPublished: false })
    .where(eq(templates.id, id))
    .returning({ id: templates.id });

  if (!updated) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}