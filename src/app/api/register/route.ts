import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isValidSlug, normalizeSlug } from "@/lib/slug";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
  displayName: z.string().min(1).max(80),
  slug: z.string().min(2).max(48),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name, displayName, slug: rawSlug } = parsed.data;
  const slug = normalizeSlug(rawSlug);
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug. Use lowercase letters, numbers, and hyphens." }, { status: 400 });
  }

  const emailNorm = email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({ where: { email: emailNorm } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const slugTaken = await prisma.creatorProfile.findUnique({ where: { slug } });
  if (slugTaken) {
    return NextResponse.json({ error: "This link slug is already taken" }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email: emailNorm,
      passwordHash,
      name: name?.trim() || null,
      role: "CREATOR",
      creatorProfile: {
        create: {
          slug,
          displayName: displayName.trim(),
          approved: false,
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
