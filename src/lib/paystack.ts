const PAYSTACK_BASE = "https://api.paystack.co";

export function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export function getPaystackPublicKey(): string {
  const key = process.env.PAYSTACK_PUBLIC_KEY;
  if (!key) throw new Error("PAYSTACK_PUBLIC_KEY is not set");
  return key;
}

export async function paystackInitialize(body: Record<string, unknown>) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: { authorization_url?: string; access_code?: string; reference?: string };
  };
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack initialize failed");
  }
  return data.data!;
}

export async function paystackVerify(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${getPaystackSecretKey()}` },
    cache: "no-store",
  });
  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data?: {
      status?: string;
      amount?: number;
      currency?: string;
      customer?: { email?: string };
      metadata?: Record<string, unknown>;
    };
  };
  if (!res.ok || !data.status) {
    throw new Error(data.message || "Paystack verify failed");
  }
  return data.data!;
}
