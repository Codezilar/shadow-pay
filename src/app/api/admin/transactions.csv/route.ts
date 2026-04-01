import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const txns = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creatorProfile: {
        select: { slug: true, displayName: true },
      },
    },
    take: 5000,
  });

  const header = [
    "createdAt",
    "status",
    "reference",
    "creatorSlug",
    "creatorName",
    "amountKobo",
    "creatorAmountKobo",
    "platformAmountKobo",
    "creatorSharePercentSnapshot",
    "customerEmail",
    "currency",
  ];

  const lines = txns.map((t) =>
    [
      t.createdAt.toISOString(),
      t.status,
      t.paystackReference,
      t.creatorProfile.slug,
      t.creatorProfile.displayName,
      t.amountKobo,
      t.creatorAmountKobo,
      t.platformAmountKobo,
      t.creatorSharePercentSnapshot,
      t.customerEmail,
      t.currency,
    ]
      .map(csvEscape)
      .join(","),
  );

  const csv = `${header.join(",")}\n${lines.join("\n")}`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
