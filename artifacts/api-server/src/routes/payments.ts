import { Router, type IRouter } from "express";
import { db, paymentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import {
  InitiatePaymentBody,
  InitiatePaymentResponse,
  VerifyPaymentBody,
  VerifyPaymentResponse,
  GetPaymentHistoryResponse,
} from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

const PLAN_PRICES: Record<string, number> = {
  monthly: 5000,
  yearly: 50000,
};

router.post("/payments/initiate", requireAuth, async (req, res): Promise<void> => {
  const parsed = InitiatePaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = (req as any).user;
  const { plan, provider } = parsed.data;
  const amount = PLAN_PRICES[plan] ?? 5000;

  const paymentRef = `FEELMS-${randomUUID().slice(0, 8).toUpperCase()}`;

  const [payment] = await db.insert(paymentsTable).values({
    userId: user.id,
    amount,
    status: "PENDING",
    provider,
    plan,
    paymentRef,
  }).returning();

  res.json(InitiatePaymentResponse.parse({
    paymentId: paymentRef,
    status: "PENDING",
    message: `Payment initiated via ${provider}. Amount: ${amount} RWF. Ref: ${paymentRef}`,
    redirectUrl: null,
  }));
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  const parsed = VerifyPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const user = (req as any).user;
  const { paymentId } = parsed.data;

  const [payment] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.paymentRef, paymentId));

  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  if (payment.userId !== user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Simulate payment verification — in production, call MTN/Airtel/Flutterwave API
  await db.update(paymentsTable)
    .set({ status: "SUCCESS", transactionId: parsed.data.transactionId ?? `TXN-${Date.now()}` })
    .where(eq(paymentsTable.id, payment.id));

  const expiry = new Date();
  if (payment.plan === "yearly") {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }

  const [updatedUser] = await db.update(usersTable)
    .set({ role: "VIP", vipExpiry: expiry })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(VerifyPaymentResponse.parse({
    success: true,
    message: "Payment verified. VIP activated!",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      vipExpiry: updatedUser.vipExpiry?.toISOString() ?? null,
      createdAt: updatedUser.createdAt.toISOString(),
    },
  }));
});

router.get("/payments/history", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const payments = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.userId, user.id));

  res.json(GetPaymentHistoryResponse.parse(payments.map(p => ({
    id: p.id,
    userId: p.userId,
    amount: p.amount,
    status: p.status,
    provider: p.provider,
    plan: p.plan ?? null,
    transactionId: p.transactionId ?? null,
    createdAt: p.createdAt.toISOString(),
  }))));
});

export default router;
