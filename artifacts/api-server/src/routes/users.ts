import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  GetUsersResponse,
  UpdateUserRoleParams,
  UpdateUserRoleBody,
  UpdateUserRoleResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    vipExpiry: u.vipExpiry instanceof Date ? u.vipExpiry.toISOString() : (u.vipExpiry ?? null),
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

router.get("/users", requireAuth, requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  res.json(GetUsersResponse.parse(users.map(serializeUser)));
});

router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateUserRoleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { role: parsed.data.role };
  if (parsed.data.vipExpiry !== undefined) {
    updateData.vipExpiry = parsed.data.vipExpiry ? new Date(parsed.data.vipExpiry) : null;
  }
  if (parsed.data.role === "VIP" && !parsed.data.vipExpiry) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    updateData.vipExpiry = expiry;
  }

  const [user] = await db.update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(UpdateUserRoleResponse.parse(serializeUser(user)));
});

router.delete("/users/me", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ error: "Password is required to delete your account" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(400).json({ error: "Incorrect password" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, user.id));
  res.sendStatus(204);
});

export default router;
