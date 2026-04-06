import { Router, type IRouter } from "express";
import healthRouter from "./health";
import restroomsRouter from "./restrooms";
import auditsRouter from "./audits";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(restroomsRouter);
router.use(auditsRouter);
router.use(authRouter);

export default router;
