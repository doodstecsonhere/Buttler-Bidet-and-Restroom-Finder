import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bidetsRouter from "./bidets";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bidetsRouter);
router.use(authRouter);

export default router;
