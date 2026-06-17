import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import moviesRouter from "./movies";
import bannersRouter from "./banners";
import sectionsRouter from "./sections";
import usersRouter from "./users";
import statsRouter from "./stats";
import episodesRouter from "./episodes";
import tvRouter from "./tv";
import interpretersRouter from "./interpreters";
import adminSettingsRouter from "./admin-settings";
import sitemapRouter from "./sitemap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(moviesRouter);
router.use(episodesRouter);
router.use(tvRouter);
router.use(bannersRouter);
router.use(sectionsRouter);
router.use(usersRouter);
router.use(statsRouter);
router.use(interpretersRouter);
router.use(adminSettingsRouter);
router.use(sitemapRouter);

export default router;
