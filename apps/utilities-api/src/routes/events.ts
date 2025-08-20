import { Router } from "express";
import { z } from "zod";
import { WildApricotService } from "@wa/WildApricotService";
import { WAEventCreate } from "@wmi/wa-api";

const router = Router();
const wa = new WildApricotService();

/** GET /api/events?q=&startDateFrom=&endDateTo=&top=&skip= */
router.get("/events", async (req, res, next) => {
  try {
    // We’ll call your service’s getEvents via a thin wrapper here.
    const search = (req.query.q as string) || undefined;
    const startDateFrom = (req.query.startDateFrom as string) || undefined;
    const endDateTo = (req.query.endDateTo as string) || undefined;
    const top = req.query.top ? Number(req.query.top) : undefined;
    const skip = req.query.skip ? Number(req.query.skip) : undefined;

    // Reuse your getEvents logic by calling WA API directly with params:
    const client = await (wa as any)["makeClient"]();         // reuse internal client
    const accountId = await (wa as any)["getAccountId"]();    // cached

    const params: any = {};
    if (search) params["$filter"] = `substringof('${search.replace(/'/g, "''")}',TextIndex)`;
    if (startDateFrom) params["StartDate"] = startDateFrom;
    if (endDateTo) params["EndDate"] = endDateTo;
    if (typeof top === "number") params["$top"] = top;
    if (typeof skip === "number") params["$skip"] = skip;

    const { data } = await client.get(`/accounts/${accountId}/events`, { params });
    res.json(Array.isArray(data) ? data : (data?.Events ?? []));
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
 * body: { templateId: number, starts: string[], endOffsetMinutes?: number, nameFormat?: string }
 */
const DuplicateSchema = z.object({
  templateId: z.number().int().positive(),
  starts: z.array(z.string().min(5)).min(1),
  endOffsetMinutes: z.number().int().optional(), // if you want to compute EndDate from StartDate
  nameFormat: z.string().optional()              // e.g. "My Event ({MM}/{DD})"
});

router.post("/events/duplicate", async (req, res, next) => {
  try {
    const body = DuplicateSchema.parse(req.body);
    const template = await wa.getEvent(body.templateId);

    // Build payloads
    const created: any[] = [];
    for (const startISO of body.starts) {
      const payload: WAEventCreate = sanitizeForCreate(template);
      payload.StartDate = startISO;

      // optional EndDate calc
      if (typeof body.endOffsetMinutes === "number" && template.EndDate) {
        const durationMs = new Date(template.EndDate).getTime() - new Date(template.StartDate).getTime();
        const end = new Date(new Date(startISO).getTime() + durationMs).toISOString();
        payload.EndDate = end;
      } else if (template.EndDate) {
        // copy exact duration if both were set on template
        const durationMs = new Date(template.EndDate).getTime() - new Date(template.StartDate).getTime();
        payload.EndDate = new Date(new Date(startISO).getTime() + durationMs).toISOString();
      }

      // optional name format
      if (body.nameFormat) {
        const d = new Date(startISO);
        const MM = String(d.getMonth() + 1).padStart(2, "0");
        const DD = String(d.getDate()).padStart(2, "0");
        payload.Name = body.nameFormat
          .replace("{MM}", MM)
          .replace("{DD}", DD)
          .replace("{NAME}", template.Name ?? "Event");
      } else {
        payload.Name = template.Name;
      }

      const ev = await wa.createEvent(payload);
      created.push(ev);
    }

    res.json(created);
  } catch (e) {
    next(e);
  }
});

function sanitizeForCreate(original: any): WAEventCreate {
  const { Id, Url, RegistrationsCount, ...rest } = original ?? {};
  return { ...rest } as WAEventCreate;
}

export default router;