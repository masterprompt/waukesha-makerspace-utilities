import { Router } from "express";
import { z } from "zod";
import { WildApricotService, DuplicateInstance } from "@wa/WildApricotService";
import { WAEventCreate } from "@wmi/wa-api";

const router = Router();
const wa = new WildApricotService();

/** GET /api/events?q=&startDateFrom=&endDateTo=&top=&skip= */
router.get("/events", async (req, res, next) => {
  try {
    const events = await wa.getEvents({
      search: (req.query.q as string) || undefined,
      startDateFrom: (req.query.startDateFrom as string) || undefined,
      endDateTo: (req.query.endDateTo as string) || undefined,
      top: req.query.top ? Number(req.query.top) : undefined,
      skip: req.query.skip ? Number(req.query.skip) : undefined,
    });

    res.json(Array.isArray(events) ? events : []);
  } catch (e) {
    next(e);
  }
});

/** GET /api/events/:id */
router.get("/events/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid event id" });
    const event = await wa.getEvent(id);
    res.json(event);
  } catch (e) {
    next(e);
  }
});


/** POST /api/events/duplicate
 * body: {
 *   templateId: number,
 *   starts: Array<string | { start: string; end?: string }>,
 *   nameFormat?: string   // e.g. "${NAME} (${MM}/${DD})"
 * }
 */
const CloneToDatesSchema = z.object({
  templateId: z.number().int().positive(),
  starts: z.array(
    z.union([
      z.string().min(5),
      z.object({
        start: z.string().min(5),
        end: z.string().min(5).optional(),
      })
    ])
  ).min(1),
  nameFormat: z.string().optional(),
});

router.post("/events/duplicate", async (req, res, next) => {
  try {
    const body = CloneToDatesSchema.parse(req.body);

    const created = await wa.cloneEventToDates(
      body.templateId,
      body.starts as DuplicateInstance[],
      body.nameFormat
    );

    res.json(created);
  } catch (e) {
    next(e);
  }
});

export default router;