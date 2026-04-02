import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(2000).optional(),
  courseTitle: z.string().max(200).optional(),
  courseDescription: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "No creator profile" }, { status: 404 });
  }

  const totals = await prisma.transaction.aggregate({
    where: { creatorProfileId: profile.id, status: "success" },
    _sum: { amountKobo: true },
    _count: true,
  });

  return NextResponse.json({
    profile,
    stats: {
      successfulCount: totals._count,
      totalAmountKobo: totals._sum.amountKobo ?? 0,
    },
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const profile = await prisma.creatorProfile.update({
    where: { userId: session.user.id },
    data: parsed.data,
  });

  return NextResponse.json({ profile });
}
