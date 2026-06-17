import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

let settings = {
  siteName: "Feelms",
  siteUrl: process.env.SITE_URL ?? "https://feelms.test",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@feelms.tv",
  maintenanceMode: false,
  allowRegistration: true,
  vipMonthlyPrice: 5000,
  vipYearlyPrice: 50000,
};

router.get("/admin/settings", requireAuth, requireAdmin, (_req, res): void => {
  res.json(settings);
});

router.patch("/admin/settings", requireAuth, requireAdmin, (req, res): void => {
  const allowed = [
    "siteName", "siteUrl", "adminEmail",
    "maintenanceMode", "allowRegistration",
    "vipMonthlyPrice", "vipYearlyPrice",
  ];
  const updates: any = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  settings = { ...settings, ...updates };
  res.json(settings);
});

export default router;
