import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  approved: z.boolean().optional(),
  creatorSharePercent: z.number().int().min(0).max(100).optional(),
  paystackSplitCode: z.union([z.string().min(1).max(64), z.null()]).optional(),
  paystackSubaccountCode: z.union([z.string().min(1).max(64), z.null()]).optional(),
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(2000).optional(),
  paymentAmounts: z.array(z.number().positive()).optional(),
  courseTitle: z.string().max(200).optional(),
  courseDescription: z.string().max(1000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const update: Prisma.CreatorProfileUpdateInput = {};
  if (data.approved !== undefined) update.approved = data.approved;
  if (data.creatorSharePercent !== undefined) update.creatorSharePercent = data.creatorSharePercent;
  if (data.paystackSplitCode !== undefined) update.paystackSplitCode = data.paystackSplitCode ?? null;
  if (data.paystackSubaccountCode !== undefined)
    update.paystackSubaccountCode = data.paystackSubaccountCode ?? null;
  if (data.displayName !== undefined) update.displayName = data.displayName;
  if (data.bio !== undefined) update.bio = data.bio;
  if (data.paymentAmounts !== undefined) update.paymentAmountsJson = JSON.stringify(data.paymentAmounts);
  if (data.courseTitle !== undefined) update.courseTitle = data.courseTitle;
  if (data.courseDescription !== undefined) update.courseDescription = data.courseDescription;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  try {
    const profile = await prisma.creatorProfile.update({
      where: { id },
      data: update,
    });
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }
}
