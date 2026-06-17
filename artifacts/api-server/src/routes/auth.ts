import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, signTempToken, verifyToken, requireAuth } from "../lib/auth";
import {
  RegisterBody,
  LoginBody,
  LoginResponse,
  GetMeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function serializeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    vipExpiry: user.vipExpiry instanceof Date ? user.vipExpiry.toISOString() : (user.vipExpiry ?? null),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    profileUpdatedAt: user.profileUpdatedAt instanceof Date ? user.profileUpdatedAt.toISOString() : (user.profileUpdatedAt ?? null),
  };
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, name } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already in use" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const allUsers = await db.select().from(usersTable);
  const role = allUsers.length === 0 ? "ADMIN" as const : "FREE" as const;

  const [user] = await db.insert(usersTable).values({
    email,
    password: hashedPassword,
    name,
    role,
  }).returning();

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json(LoginResponse.parse({ token, user: serializeUser(user) }));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.role === "ADMIN") {
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await db.update(usersTable)
      .set({ twoFaCode: otp, twoFaExpiry: expiry })
      .where(eq(usersTable.id, user.id));

    const tempToken = signTempToken({ userId: user.id, role: user.role, twoFaPending: true });
    res.json({ requires2FA: true, tempToken, devCode: otp });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json(LoginResponse.parse({ token, user: serializeUser(user) }));
});

router.post("/auth/2fa/verify", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No session token provided" });
    return;
  }

  const tempToken = authHeader.slice(7);
  const payload = verifyToken(tempToken);
  if (!payload || !payload.twoFaPending) {
    res.status(401).json({ error: "Invalid or expired session. Please log in again." });
    return;
  }

  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: "Verification code is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId));
  if (!user || !user.twoFaCode || !user.twoFaExpiry) {
    res.status(400).json({ error: "No 2FA pending for this account" });
    return;
  }

  if (new Date() > user.twoFaExpiry) {
    res.status(400).json({ error: "Code expired. Please log in again." });
    return;
  }

  if (user.twoFaCode !== String(code).trim()) {
    res.status(400).json({ error: "Incorrect verification code" });
    return;
  }

  await db.update(usersTable)
    .set({ twoFaCode: null, twoFaExpiry: null })
    .where(eq(usersTable.id, user.id));

  const token = signToken({ userId: user.id, role: user.role });
  res.json({ token, user: serializeUser(user) });
});

router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.json({ message: "If an account with that email exists, a reset link has been sent." });
    return;
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000);

  await db.update(usersTable)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(usersTable.id, user.id));

  res.json({
    message: "Reset token generated. In production this would be emailed.",
    resetToken: token,
  });
});

router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
  if (!user || !user.resetTokenExpiry) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  if (new Date() > user.resetTokenExpiry) {
    res.status(400).json({ error: "Reset token has expired. Please request a new one." });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable)
    .set({ password: hashed, resetToken: null, resetTokenExpiry: null })
    .where(eq(usersTable.id, user.id));

  res.json({ message: "Password reset successfully. You can now log in." });
});

router.patch("/auth/profile", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  if (user.profileUpdatedAt) {
    const lastUpdate = new Date(user.profileUpdatedAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (lastUpdate > sevenDaysAgo) {
      const nextUpdateAt = new Date(lastUpdate.getTime() + 7 * 24 * 60 * 60 * 1000);
      res.status(429).json({
        error: "Profile can only be updated once per week",
        nextUpdateAt: nextUpdateAt.toISOString(),
      });
      return;
    }
  }

  const { name, email, currentPassword, newPassword } = req.body;
  const updates: any = { profileUpdatedAt: new Date() };

  if (name && typeof name === "string" && name.trim()) {
    updates.name = name.trim();
  }

  if (email && typeof email === "string" && email.includes("@")) {
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing && existing.id !== user.id) {
      res.status(400).json({ error: "Email already in use by another account" });
      return;
    }
    updates.email = email.trim().toLowerCase();
  }

  if (currentPassword && newPassword) {
    if (newPassword.length < 6) {
      res.status(400).json({ error: "New password must be at least 6 characters" });
      return;
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  const [updated] = await db.update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json(serializeUser(updated));
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  res.json(serializeUser(user));
});

export default router;
