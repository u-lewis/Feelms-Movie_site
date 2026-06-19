import app from "./app";
import { logger } from "./lib/logger";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { seedSeriesData } from "./seed-series";
import { seedMoviesData, seedBannersData, seedSectionsData } from "./seed-movies";

async function seedAdminAccount() {
  const ADMIN_EMAIL = "admin@feelms.com";
  const ADMIN_PASSWORD = "admin123!";

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL));

  if (!existing) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db.insert(usersTable).values({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    });
    logger.info("Admin account created: admin@feelms.com");
  } else if (existing.role !== "ADMIN") {
    await db.update(usersTable).set({ role: "ADMIN" }).where(eq(usersTable.email, ADMIN_EMAIL));
    logger.info("Existing account promoted to ADMIN: admin@feelms.com");
  }
}

const rawPort = process.env["PORT"];

const port = Number(process.env.PORT || 3001);
seedAdminAccount()
  .then(() => seedSeriesData())
  .then(() => seedMoviesData())
  .then(() => seedBannersData())
  .then(() => seedSectionsData())
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
});
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to seed admin account");
    process.exit(1);
  });
