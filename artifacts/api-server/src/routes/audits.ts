import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { restroomAuditsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/audits", async (_req, res) => {
  const audits = await db.select().from(restroomAuditsTable).orderBy(restroomAuditsTable.createdAt);

  const grouped: Record<number, { count: number; audits: typeof audits }> = {};
  for (const audit of audits) {
    if (!grouped[audit.restroomId]) {
      grouped[audit.restroomId] = { count: 0, audits: [] };
    }
    grouped[audit.restroomId].count++;
    grouped[audit.restroomId].audits.push(audit);
  }

  res.json(grouped);
});

router.post("/audits", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "You must be logged in to submit an audit." });
    return;
  }

  const {
    restroomId,
    restroomName,
    latitude,
    longitude,
    pwdAccessible,
    hasSoap,
    hasToiletSeat,
    hasTissue,
    hasFunctionalBidet,
    remarks,
  } = req.body;

  if (
    restroomId === undefined ||
    !restroomName ||
    !latitude ||
    !longitude ||
    pwdAccessible === undefined ||
    hasSoap === undefined ||
    hasToiletSeat === undefined ||
    hasTissue === undefined ||
    hasFunctionalBidet === undefined
  ) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  const tierStatus = pwdAccessible ? "tier_1" : "tier_0";

  const [audit] = await db
    .insert(restroomAuditsTable)
    .values({
      userId: req.user.id,
      restroomId: Number(restroomId),
      restroomName: String(restroomName),
      latitude: String(latitude),
      longitude: String(longitude),
      pwdAccessible: Boolean(pwdAccessible),
      hasSoap: Boolean(hasSoap),
      hasToiletSeat: Boolean(hasToiletSeat),
      hasTissue: Boolean(hasTissue),
      hasFunctionalBidet: Boolean(hasFunctionalBidet),
      remarks: remarks ? String(remarks) : null,
      tierStatus,
    })
    .returning();

  res.status(201).json(audit);
});

export default router;
