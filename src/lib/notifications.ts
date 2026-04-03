import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  absoluteUrl,
  creatorPostAdminEmail,
  creatorPostStudentEmail,
  getAdminEmails,
  paymentSuccessAdminEmail,
  paymentSuccessCreatorEmail,
  paymentSuccessStudentEmail,
  sendEmailOnce,
  withdrawalRequestAdminEmail,
  withdrawalRequestCreatorEmail,
} from "@/lib/email";

function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

export async function notifyPaymentSuccess(reference: string, communityPath?: string | null) {
  const transaction = await prisma.transaction.findUnique({
    where: { paystackReference: reference },
    include: {
      creatorProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!transaction || transaction.status !== "success" || !transaction.customerEmail) return;

  const creatorName = transaction.creatorProfile.displayName || transaction.creatorProfile.user.name || transaction.creatorProfile.user.email;
  const studentName = transaction.customerEmail.split("@")[0];
  const courseTitle = transaction.creatorProfile.courseTitle || transaction.creatorProfile.displayName;
  const amount = formatNgnFromKobo(transaction.amountKobo);
  const communityUrl = absoluteUrl(communityPath || `/community/${transaction.creatorProfile.slug}`);

  const studentEmail = paymentSuccessStudentEmail({
    studentName,
    courseTitle,
    amount,
    creatorName,
    communityUrl,
  });
  await sendEmailOnce({
    eventKey: `payment-success:student:${reference}:${transaction.customerEmail.toLowerCase()}`,
    eventType: "payment-success-student",
    to: transaction.customerEmail,
    subject: studentEmail.subject,
    html: studentEmail.html,
  });

  const creatorEmail = paymentSuccessCreatorEmail({
    creatorName,
    studentEmail: transaction.customerEmail,
    courseTitle,
    amount,
  });
  await sendEmailOnce({
    eventKey: `payment-success:creator:${reference}:${transaction.creatorProfile.user.email.toLowerCase()}`,
    eventType: "payment-success-creator",
    to: transaction.creatorProfile.user.email,
    subject: creatorEmail.subject,
    html: creatorEmail.html,
  });

  const adminEmails = await getAdminEmails();
  await Promise.all(
    adminEmails.map(async (adminEmail) => {
      const adminMessage = paymentSuccessAdminEmail({
        creatorName,
        studentEmail: transaction.customerEmail!,
        courseTitle,
        amount,
      });
      await sendEmailOnce({
        eventKey: `payment-success:admin:${reference}:${adminEmail}`,
        eventType: "payment-success-admin",
        to: adminEmail,
        subject: adminMessage.subject,
        html: adminMessage.html,
      });
    })
  );
}

export async function notifyCreatorPost(messageId: string) {
  const message = await prisma.communityMessage.findUnique({
    where: { id: messageId },
    include: {
      creatorProfile: {
        include: {
          user: true,
          studentEnrollments: {
            include: {
              user: true,
              accessTokens: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!message || message.authorRole !== Role.CREATOR) return;

  const creatorName = message.creatorProfile.displayName || message.creatorProfile.user.name || message.creatorProfile.user.email;
  const courseTitle = message.creatorProfile.courseTitle || message.creatorProfile.displayName;
  const preview = message.body.length > 180 ? `${message.body.slice(0, 177)}...` : message.body;

  await Promise.all(
    message.creatorProfile.studentEnrollments.map(async (enrollment) => {
      const latestToken = enrollment.accessTokens[0]?.token;
      const communityPath = latestToken
        ? `/community/${message.creatorProfile.slug}?access=${latestToken}`
        : `/community/${message.creatorProfile.slug}`;
      const email = creatorPostStudentEmail({
        studentName: enrollment.user.name?.trim() || enrollment.customerEmail,
        creatorName,
        courseTitle,
        preview,
        communityUrl: absoluteUrl(communityPath),
      });

      await sendEmailOnce({
        eventKey: `community-post:student:${message.id}:${enrollment.customerEmail.toLowerCase()}`,
        eventType: "community-post-student",
        to: enrollment.customerEmail,
        subject: email.subject,
        html: email.html,
      });
    })
  );

  const adminEmails = await getAdminEmails();
  await Promise.all(
    adminEmails.map(async (adminEmail) => {
      const email = creatorPostAdminEmail({
        creatorName,
        courseTitle,
        preview,
        communityUrl: absoluteUrl(`/community/${message.creatorProfile.slug}`),
      });
      await sendEmailOnce({
        eventKey: `community-post:admin:${message.id}:${adminEmail}`,
        eventType: "community-post-admin",
        to: adminEmail,
        subject: email.subject,
        html: email.html,
      });
    })
  );
}

export async function notifyWithdrawalRequest(requestId: string) {
  const request = await prisma.withdrawalRequest.findUnique({
    where: { id: requestId },
    include: {
      creatorProfile: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!request) return;

  const creatorName = request.creatorProfile.displayName || request.creatorProfile.user.name || request.creatorProfile.user.email;
  const amount = formatNgnFromKobo(request.amountKobo);

  const creatorEmail = withdrawalRequestCreatorEmail({
    creatorName,
    amount,
    dashboardUrl: absoluteUrl("/dashboard"),
  });
  await sendEmailOnce({
    eventKey: `withdrawal-request:creator:${request.id}:${request.creatorProfile.user.email.toLowerCase()}`,
    eventType: "withdrawal-request-creator",
    to: request.creatorProfile.user.email,
    subject: creatorEmail.subject,
    html: creatorEmail.html,
  });

  const adminEmails = await getAdminEmails();
  await Promise.all(
    adminEmails.map(async (adminEmail) => {
      const adminMessage = withdrawalRequestAdminEmail({
        creatorName,
        creatorEmail: request.creatorProfile.user.email,
        amount,
        adminUrl: absoluteUrl("/admin/withdrawals"),
      });
      await sendEmailOnce({
        eventKey: `withdrawal-request:admin:${request.id}:${adminEmail}`,
        eventType: "withdrawal-request-admin",
        to: adminEmail,
        subject: adminMessage.subject,
        html: adminMessage.html,
      });
    })
  );
}
