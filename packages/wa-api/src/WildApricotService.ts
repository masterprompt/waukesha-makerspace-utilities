import axios, { AxiosInstance } from "axios";
import qs from "qs";
import { EnvironmentService } from "./EnvironmentService";
import { set } from 'lodash-es';

/** Payload for creating an event */
export interface WAEventCreate {
  Name: string;
  StartDate: string;
  EndDate?: string;
  Location?: string;
  Timezone?: string;
  Details?: string;
  AccessLevel?: string;
  RegistrationTypes?: Array<any>;
  Tags?: string[];
  [key: string]: any;
}

/** Full event returned by WA GET /events/{id} */
export interface WAEvent extends WAEventCreate {
  Id: number;
  Url: string;
  RegistrationsCount: number;
  CreatedDate?: string;
  ModifiedDate?: string;
}

export interface GetEventsOptions {
  /** Free-text search across event text index (name, tags, location, etc.) */
  search?: string;
  /** Inclusive lower bound for StartDate (ISO8601) */
  startDateFrom?: string;
  /** Inclusive upper bound for EndDate (ISO8601) */
  endDateTo?: string;
  /** Page size limit */
  top?: number;
  /** Offset for paging */
  skip?: number;
}

export type DuplicateInstance =
  | string
  | {
      start: string;
      end?: string;
    };

export class WildApricotService {
  private readonly apiKey: string;
  private readonly scope: string;

  // OAuth token cache
  private tokenCache: { token: string; expiresAt: number } | null = null;

  // Account Id cache (and in-flight promise to dedupe concurrent requests)
  private accountIdCache: number | null = null;
  private accountIdPromise: Promise<number> | null = null;

  private readonly OAUTH_URL = "https://oauth.wildapricot.org/auth/token";
  private readonly API_BASE  = "https://api.wildapricot.org/v2.2";

  constructor() {
    this.apiKey = EnvironmentService.getString("WA_API_KEY");
    this.scope  = EnvironmentService.getString("WA_SCOPE", false, "auto");

    // If provided, seed account id cache from env
    const envAccount = process.env.WA_ACCOUNT_ID;
    if (envAccount && !Number.isNaN(Number(envAccount))) {
      this.accountIdCache = Number(envAccount);
    }
  }

  /** Public helper if you ever want to clear caches manually. */
  public clearCaches() {
    this.tokenCache = null;
    this.accountIdCache = null;
    this.accountIdPromise = null;
  }

  /** ---- Internal: Token handling (API key flow) ---- */
  private async getAccessTokenWithApiKey(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.tokenCache && this.tokenCache.expiresAt > now + 30) {
      return this.tokenCache.token;
    }

    const body  = qs.stringify({ grant_type: "client_credentials", scope: this.scope });
    const basic = Buffer.from(`APIKEY:${this.apiKey}`).toString("base64");

    const resp = await axios.post(this.OAUTH_URL, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basic}`,
      },
    });

    const token     = resp.data.access_token as string;
    const expiresIn = resp.data.expires_in   as number;

    this.tokenCache = { token, expiresAt: now + expiresIn };
    return token;
  }

  private async makeClient(): Promise<AxiosInstance> {
    const token = await this.getAccessTokenWithApiKey();
    return axios.create({
      baseURL: this.API_BASE,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /** ---- Account Id: cached + de-duped fetch ---- */
  private async getAccountId(): Promise<number> {
    // Fast path: cached value
    if (this.accountIdCache !== null) return this.accountIdCache;

    // De-dupe concurrent callers
    if (this.accountIdPromise) return this.accountIdPromise;

    this.accountIdPromise = (async () => {
      // If env was set but invalid, we’ll ignore and fetch below.
      const client = await this.makeClient();
      const { data } = await client.get("/accounts");
      if (!Array.isArray(data) || data.length === 0 || !data[0]?.Id) {
        throw new Error("No accounts returned from Wild Apricot API");
      }
      const id = Number(data[0].Id);
      if (Number.isNaN(id)) throw new Error("Returned account Id is not a number");
      this.accountIdCache = id;
      this.accountIdPromise = null;
      return id;
    })().catch((e) => {
      // Reset promise on failure so future calls can retry
      this.accountIdPromise = null;
      throw e;
    });

    return this.accountIdPromise;
  }

  /** ---- Public API convenience methods (no accountId arg needed) ---- */

  /** Get an event by eventId (account id resolved/cached automatically). */
  public async getEvent(eventId: number): Promise<WAEvent> {
    const [client, accountId] = await Promise.all([this.makeClient(), this.getAccountId()]);
    const { data } = await client.get(`/accounts/${accountId}/events/${eventId}`);
    return data;
  }

  /** Create a new event with a payload (account id resolved/cached automatically). */
  public async createEvent(payload: WAEventCreate): Promise<WAEvent> {
    const [client, accountId] = await Promise.all([this.makeClient(), this.getAccountId()]);
    const { data } = await client.post(`/accounts/${accountId}/events`, payload);
    return data;
  }

    /**
   * Get a list of events with optional filters.
   * Supports:
   *  - search: substring match across TextIndex (name/tags/location/etc.)
   *  - startDateFrom / endDateTo: time window
   *  - top / skip: pagination
   */
  public async getEvents(options: GetEventsOptions = {}): Promise<WAEvent[]> {
    const [client, accountId] = await Promise.all([this.makeClient(), this.getAccountId()]);

    // Build query params
    const params: Record<string, string | number | boolean> = {};

    params["$orderby"] = "StartDate asc"; // always order by StartDate ascending  
    params["$top"] = 25;              // default page size if not specified
    // Date window (Admin API supports StartDate/EndDate filtering on the list)
    if (options.startDateFrom) params["StartDate"] = options.startDateFrom;
    if (options.endDateTo)     params["EndDate"]   = options.endDateTo;

    // Text search via TextIndex + substringof() using $filter
    // Example: $filter=substringof('open house',TextIndex)
    if (options.search && options.search.trim()) {
      const value = options.search.replace(/'/g, "''"); // escape single quotes
      params["$filter"] = `substringof('Name','${value}')`;
    }

    // Paging
    if (typeof options.top === "number")  params["$top"]  = options.top;
    if (typeof options.skip === "number") params["$skip"] = options.skip;
    console.log('params:', params)
    const { data } = await client.get(
      `/accounts/${accountId}/events`,
      { params }
    );

    // The Admin API returns an array of events
    return Array.isArray(data) ? data : (data?.Events ?? []);
  }

  createError(err: any, extras: string[] = []) {
      // unwrap axios error
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const body = err?.response?.data;
      const msg = [
        `CloneEvent failed: ${status ?? "??"} ${statusText ?? ""}`,
        ...extras,
        body ? `Response body: ${JSON.stringify(body, null, 2)}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      console.error(msg);
      return new Error(msg);
  }

  /**
   * Low-level: call WA CloneEvent RPC to duplicate an event as-is.
   * Returns the newly created event object (as WAEvent).
   */
  public async cloneEvent(templateEventId: number): Promise<WAEvent> {
    const [client, accountId] = await Promise.all([
      this.makeClient(),
      this.getAccountId()
    ]);

    const url = `/rpc/${accountId}/CloneEvent`;

    try {
      const { data: clonedEventId } = await client.post(url, {
        EventId: templateEventId,
      });
      const clonedEvent = await this.getEvent(clonedEventId);
      return clonedEvent;
    } catch (err: any) {
      throw this.createError(err, [
        `EventId: ${templateEventId}`
      ]);
    }
  }
    /**
   * Convenience: clone, then apply field overrides (e.g., StartDate/EndDate/Name).
   * Only the fields you provide are updated on the clone.
   */
  public async cloneEventWithOverrides(
    templateEventId: number,
    overrides: Partial<WAEventCreate>
  ): Promise<WAEvent> {
    const [client, accountId] = await Promise.all([this.makeClient(), this.getAccountId()]);

    // 1) clone
    const cloned = await this.cloneEvent(templateEventId);
    console.log("Cloned event:", cloned);
    try {
      if (overrides && Object.keys(overrides).length) {

        const newEvent = { ...cloned, ...overrides, Id: cloned.Id };
        //set(newEvent, 'Details.AccessControl.AccessLevel', 'Public');
        console.log("Applying overrides:", {overrides, newEvent});
        const { data } = await client.put(
          `/accounts/${accountId}/events/${cloned.Id}`,
          newEvent // WA expects full-ish object with Id on PUT
        );
        return data as WAEvent;
      }
    } catch (err) {
      throw this.createError(err, [
        `cloned: ${cloned}`
      ]);
    }
    
    // 2) update cloned event with overrides (if any)
    return cloned;
  }

  /**
   * Bonus utility: clone the template to many date/times (sequentially),
   * copying the original duration when EndDate isn’t supplied.
   */
  public async cloneEventToDates(
    templateEventId: number,
    starts: Array<string | { start: string; end?: string }>,
    nameFormat?: string // e.g. "${NAME} (${MM}/${DD})"
  ): Promise<WAEvent[]> {
    const template = await this.getEvent(templateEventId);
    const normalize = (x: string | { start: string; end?: string }) =>
      typeof x === "string" ? { start: x } : x;

    const out: WAEvent[] = [];
    for (const raw of starts.map(normalize)) {
      try {
        //  Calculate end time
        const end = raw.end ??
          (template.StartDate && template.EndDate
            ? new Date(new Date(raw.start).getTime() +
                (new Date(template.EndDate).getTime() - new Date(template.StartDate).getTime())
              ).toISOString()
            : undefined);

        const name = this.formatName(template.Name, raw.start, nameFormat); // you already have formatName

        const created = await this.cloneEventWithOverrides(templateEventId, {
          Name: name,
          StartDate: raw.start,
          ...(end ? { EndDate: end } : {}),
        });

        out.push(created);
      } catch (e) {
        console.error("Error cloning to date:", raw, e);
      }
    }
    return out;
  }

    /** Apply name format tokens */
  private formatName(templateName: string, startISO: string, fmt?: string): string {
    if (!fmt) return templateName;
    const d = new Date(startISO);
    const YYYY = String(d.getFullYear());
    const MM   = String(d.getMonth() + 1).padStart(2, "0");
    const DD   = String(d.getDate()).padStart(2, "0");
    return fmt
      .replace(/\$\{NAME\}/g, templateName)
      .replace(/\$\{YYYY\}/g, YYYY)
      .replace(/\$\{MM\}/g, MM)
      .replace(/\$\{DD\}/g, DD);
  }
}