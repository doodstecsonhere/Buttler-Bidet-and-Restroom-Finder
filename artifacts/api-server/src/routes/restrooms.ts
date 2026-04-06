import { Router, type IRouter } from "express";
import { RESTROOMS } from "../data/restrooms";

const router: IRouter = Router();

router.get("/restrooms", (_req, res) => {
  res.json(RESTROOMS);
});

export default router;
