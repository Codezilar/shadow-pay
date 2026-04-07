import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

function appUrl(): string {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const normalizedVercelUrl = vercelUrl
    ? vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")
      ? vercelUrl
      : `https://${vercelUrl}`
    : undefined;
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || normalizedVercelUrl;
  if (!url) throw new Error("Set NEXT_PUBLIC_APP_URL (or AUTH_URL) to your public site URL");
  return url.replace(/\/$/, "");
}

function emailFrom(): string {
  return process.env.EMAIL_FROM || "CreatorPay NG <notifications@creatorpay.ng>";
}

function extractEmailAddress(value: string | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  const angleMatch = trimmed.match(/<([^>]+)>/);
  const candidate = angleMatch ? angleMatch[1].trim() : trimmed;

  return candidate.includes("@") ? candidate : null;
}

function replyTo(): string | undefined {
  return process.env.EMAIL_REPLY_TO || undefined;
}

function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const configuredUser = process.env.SMTP_USER?.trim();
  const fallbackUser = extractEmailAddress(emailFrom()) || extractEmailAddress(process.env.EMAIL_REPLY_TO);
  const user = configuredUser && configuredUser.includes("@") ? configuredUser : fallbackUser;
  const pass = process.env.SMTP_PASS;

  if (!host || !portRaw || !user || !pass) return null;

  const port = Number(portRaw);
  if (!Number.isFinite(port)) return null;

  const secureRaw = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureRaw ? secureRaw === "true" : port === 465;

  return { host, port, secure, user, pass };
}

function supportEmail() {
  return process.env.SUPPORT_EMAIL || process.env.ADMIN_EMAIL || "support@creatorpay.ng";
}

async function findEmailDeliveryLog(eventKey: string) {
  try {
    return await prisma.emailDeliveryLog.findUnique({ where: { eventKey } });
  } catch (error) {
    console.warn("Email delivery log lookup failed; continuing without dedupe.", error);
    return null;
  }
}

async function writeEmailDeliveryLog({
  eventKey,
  eventType,
  recipient,
  status,
  error,
}: {
  eventKey: string;
  eventType: string;
  recipient: string;
  status: "SENT" | "FAILED";
  error?: string | null;
}) {
  try {
    await prisma.emailDeliveryLog.upsert({
      where: { eventKey },
      create: {
        eventKey,
        eventType,
        recipient,
        status,
        error: error ?? null,
      },
      update: {
        status,
        error: error ?? null,
      },
    });
  } catch (logError) {
    console.warn("Email delivery log write failed.", logError);
  }
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const config = smtpConfig();
  if (!config) return null;

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return cachedTransporter;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderParagraphs(lines: string[]) {
  return lines
    .map((line) => `<p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;line-height:1.7;">${escapeHtml(line)}</p>`)
    .join("");
}

function renderFacts(facts: Array<{ label: string; value: string }>) {
  return facts
    .map(
      (fact) => `
        <tr>
          <td style="padding:0 0 10px;color:#7dd3fc;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">${escapeHtml(fact.label)}</td>
          <td style="padding:0 0 10px;color:#f8fafc;font-size:14px;text-align:right;">${escapeHtml(fact.value)}</td>
        </tr>
      `
    )
    .join("");
}

function emailShell({
  eyebrow,
  title,
  intro,
  facts = [],
  cta,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro: string[];
  facts?: Array<{ label: string; value: string }>;
  cta?: { label: string; href: string };
  footer?: string;
}) {
  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:24px;background:#040712;font-family:Avenir Next,Segoe UI,Arial,sans-serif;">
        <div style="max-width:640px;margin:0 auto;background:
          radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 28%),
          radial-gradient(circle at 85% 10%, rgba(217,70,239,0.10), transparent 24%),
          linear-gradient(180deg, rgba(8,13,31,0.98) 0%, rgba(5,9,22,1) 100%);
          border:1px solid rgba(148,163,184,0.16);border-radius:28px;overflow:hidden;box-shadow:0 28px 90px rgba(2,6,23,0.55);">
          <div style="padding:36px 32px 24px;border-bottom:1px solid rgba(148,163,184,0.12);">
            <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(34,211,238,0.10);border:1px solid rgba(34,211,238,0.22);color:#a5f3fc;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:700;">
              ${escapeHtml(eyebrow)}
            </div>
            <h1 style="margin:18px 0 0;color:#f8fafc;font-size:30px;line-height:1.15;font-weight:700;">${escapeHtml(title)}</h1>
          </div>
          <div style="padding:28px 32px 18px;">
            ${renderParagraphs(intro)}
            ${
              facts.length > 0
                ? `<div style="margin:24px 0;padding:20px;border-radius:22px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.14);">
                    <table style="width:100%;border-collapse:collapse;">${renderFacts(facts)}</table>
                  </div>`
                : ""
            }
            ${
              cta
                ? `<div style="margin:28px 0 12px;">
                    <a href="${escapeHtml(cta.href)}" target="_blank" rel="noreferrer noopener" style="display:inline-block;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#2563eb,#06b6d4);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;">
                      ${escapeHtml(cta.label)}
                    </a>
                  </div>`
                : ""
            }
          </div>
          <div style="padding:18px 32px 30px;color:#64748b;font-size:12px;line-height:1.6;">
            ${escapeHtml(footer || `Need help? Reply to this email or contact ${supportEmail()}.`)}
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendEmailOnce({
  eventKey,
  eventType,
  to,
  subject,
  html,
}: {
  eventKey: string;
  eventType: string;
  to: string;
  subject: string;
  html: string;
}) {
  const email = to.trim().toLowerCase();
  if (!email) return;

  const existing = await findEmailDeliveryLog(eventKey);
  if (existing?.status === "SENT") return;

  const transporter = getTransporter();
  if (!transporter) {
    console.warn(`Email skipped for ${eventType}: SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS are not fully configured`);
    return;
  }

  try {
    await transporter.sendMail({
      from: emailFrom(),
      to: email,
      replyTo: replyTo(),
      subject,
      html,
    });

    await writeEmailDeliveryLog({
      eventKey,
      eventType,
      recipient: email,
      status: "SENT",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error(`Email send failed for ${eventType} -> ${email}: ${message}`);
    await writeEmailDeliveryLog({
      eventKey,
      eventType,
      recipient: email,
      status: "FAILED",
      error: message,
    });
  }
}

export async function getAdminEmails() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });

  const fallback = process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : [];
  return [...new Set([...admins.map((admin) => admin.email.trim().toLowerCase()), ...fallback.map((email) => email.trim().toLowerCase())])];
}

export function paymentSuccessStudentEmail(args: {
  studentName: string;
  courseTitle: string;
  amount: string;
  creatorName: string;
  communityUrl: string;
}) {
  return {
    subject: `Payment confirmed for ${args.courseTitle}`,
    html: emailShell({
      eyebrow: "Student Access Granted",
      title: "Your payment was successful",
      intro: [
        `Hi ${args.studentName}, your payment was confirmed and your access is now active.`,
        `You can now enter the private course community for ${args.courseTitle} and participate fully.`,
      ],
      facts: [
        { label: "Course", value: args.courseTitle },
        { label: "Amount", value: args.amount },
        { label: "Creator", value: args.creatorName },
      ],
      cta: { label: "Enter course community", href: args.communityUrl },
    }),
  };
}

export function paymentSuccessCreatorEmail(args: {
  creatorName: string;
  studentEmail: string;
  courseTitle: string;
  amount: string;
}) {
  return {
    subject: `New successful payment for ${args.courseTitle}`,
    html: emailShell({
      eyebrow: "Creator Payment Alert",
      title: "A student completed payment",
      intro: [
        `Hi ${args.creatorName}, a student has successfully paid for your course.`,
        "Their access has been provisioned automatically and they can now join the community.",
      ],
      facts: [
        { label: "Course", value: args.courseTitle },
        { label: "Student", value: args.studentEmail },
        { label: "Amount", value: args.amount },
      ],
    }),
  };
}

export function paymentSuccessAdminEmail(args: {
  creatorName: string;
  studentEmail: string;
  courseTitle: string;
  amount: string;
}) {
  return {
    subject: `Payment success: ${args.courseTitle}`,
    html: emailShell({
      eyebrow: "Admin Revenue Alert",
      title: "A course payment was completed",
      intro: [
        "A new successful payment has been recorded on the platform.",
        "Student access and course community provisioning have been completed.",
      ],
      facts: [
        { label: "Creator", value: args.creatorName },
        { label: "Student", value: args.studentEmail },
        { label: "Course", value: args.courseTitle },
        { label: "Amount", value: args.amount },
      ],
      cta: { label: "Open admin dashboard", href: `${appUrl()}/admin` },
    }),
  };
}

export function creatorPostStudentEmail(args: {
  studentName: string;
  creatorName: string;
  courseTitle: string;
  preview: string;
  communityUrl: string;
}) {
  return {
    subject: `New community update in ${args.courseTitle}`,
    html: emailShell({
      eyebrow: "Community Update",
      title: "Your creator posted a new update",
      intro: [
        `Hi ${args.studentName}, ${args.creatorName} just posted in the course community for ${args.courseTitle}.`,
        args.preview,
      ],
      cta: { label: "Open community", href: args.communityUrl },
    }),
  };
}

export function creatorPostAdminEmail(args: {
  creatorName: string;
  courseTitle: string;
  preview: string;
  communityUrl: string;
}) {
  return {
    subject: `Creator update in ${args.courseTitle}`,
    html: emailShell({
      eyebrow: "Admin Community Alert",
      title: "A creator posted in their community",
      intro: [
        `${args.creatorName} published a new post inside the course community for ${args.courseTitle}.`,
        args.preview,
      ],
      cta: { label: "Review community", href: args.communityUrl },
    }),
  };
}

export function creatorApprovedEmail(args: {
  creatorName: string;
  creatorEmail: string;
  dashboardUrl: string;
}) {
  return {
    subject: "Your creator profile has been approved",
    html: emailShell({
      eyebrow: "Creator Approved",
      title: "Your creator profile is now live",
      intro: [
        `Hi ${args.creatorName}, your creator profile has been approved by the admin team.`,
        "You can now sign in to manage your profile, payouts, and course setup from your dashboard.",
      ],
      facts: [{ label: "Account", value: args.creatorEmail }],
      cta: { label: "Open creator dashboard", href: args.dashboardUrl },
    }),
  };
}

export function withdrawalRequestCreatorEmail(args: {
  creatorName: string;
  amount: string;
  dashboardUrl: string;
}) {
  return {
    subject: `Withdrawal request received for ${args.amount}`,
    html: emailShell({
      eyebrow: "Withdrawal Submitted",
      title: "Your withdrawal request is in queue",
      intro: [
        `Hi ${args.creatorName}, your withdrawal request has been submitted successfully.`,
        "The admin team has been notified and will move it through review and completion.",
      ],
      facts: [{ label: "Requested amount", value: args.amount }],
      cta: { label: "Open creator dashboard", href: args.dashboardUrl },
    }),
  };
}

export function withdrawalRequestAdminEmail(args: {
  creatorName: string;
  creatorEmail: string;
  amount: string;
  adminUrl: string;
}) {
  return {
    subject: `New withdrawal request: ${args.amount}`,
    html: emailShell({
      eyebrow: "Admin Withdrawal Alert",
      title: "A creator requested withdrawal",
      intro: [
        "A new withdrawal request has been submitted and is waiting for review.",
        "Open the withdrawals dashboard to move it through the payout workflow.",
      ],
      facts: [
        { label: "Creator", value: args.creatorName },
        { label: "Email", value: args.creatorEmail },
        { label: "Amount", value: args.amount },
      ],
      cta: { label: "Open withdrawals", href: args.adminUrl },
    }),
  };
}

export function absoluteUrl(path: string) {
  return `${appUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
