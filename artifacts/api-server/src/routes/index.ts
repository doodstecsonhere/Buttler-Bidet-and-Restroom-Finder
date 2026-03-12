import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bidetsRouter from "./bidets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bidetsRouter);

export default router;
