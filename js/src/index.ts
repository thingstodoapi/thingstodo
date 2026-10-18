// Things To Do API client: search local events in plain words.
// Docs: https://thingstodoapi.com/docs/

export const CATEGORIES = [
  'music', 'arts', 'social', 'festival', 'market',
  'popup', 'supper_club', 'exhibition', 'class', 'sports',
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Venue {
  name: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Event {
  id: string;
  title: string;
  category: Category;
  /** UTC, ISO 8601. */
  starts_at: string;
  ends_at: string | null;
  /** The same time where the event is: date, time and IANA timezone. */
  local: { date: string; time: string | null; end_date?: string | null; timezone: string };
  ongoing?: boolean;
  venue: Venue | null;
  summary: string | null;
  tags: string[];
  price: string | null;
  links: { source: string | null; tickets: string | null };
  last_verified: string;
  /** Only when searching around a point. */
  distance_km?: number;
  match?: { score: number; via: string[] };
}

export interface SearchParams {
  /** Plain words. Time and place in them are understood: "jazz in oakland this weekend". */
  q?: string;
  /** ISO 8601. Default: now to 30 days out. */
  from?: string;
  to?: string;
  /** A city or neighborhood by name. */
  place?: string;
  lat?: number;
  lng?: number;
  /** Radius around lat/lng. Default 5. */
  km?: number;
  category?: Category | Category[];
  /** Up to 50. Default 20. */
  limit?: number;
  offset?: number;
  sort?: 'relevance' | 'time';
}

export interface SearchResult {
  query: {
    q?: string;
    interpreted: {
      topic: string | null;
      from: string;
      to: string;
      when: string | null;
      place: string | null;
      categories: Category[] | null;
      metro: string | null;
    };
  };
  results: Event[];
  /** Pass back as `offset` for the next page; null when there are no more. */
  next_offset: number | null;
  /** Set when the place isn't covered or nothing matched. */
  message?: string;
}

export interface Coverage {
  metros: { id: string; name: string; timezone: string; cities: { name: string }[] }[];
  categories: Category[];
}

export interface ClientOptions {
  /** A key from https://thingstodoapi.com/signup/. Without one, 50 calls a day. Defaults to THINGSTODO_API_KEY. */
  apiKey?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export class ThingsToDoError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly retryAfter?: number) {
    super(message);
    this.name = 'ThingsToDoError';
  }
}

export class ThingsToDo {
  private apiKey?: string;
  private baseUrl: string;
  private fetch: typeof fetch;

  constructor(options: ClientOptions = {}) {
    const env = typeof process !== 'undefined' ? process.env?.THINGSTODO_API_KEY : undefined;
    this.apiKey = options.apiKey ?? env;
    this.baseUrl = (options.baseUrl ?? 'https://api.thingstodoapi.com').replace(/\/$/, '');
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /** Search events. A string is the plain-words query. */
  search(params: string | SearchParams): Promise<SearchResult> {
    const p: SearchParams = typeof params === 'string' ? { q: params } : params;
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(p)) {
      if (v === undefined || v === null || v === '') continue;
      qs.set(k, Array.isArray(v) ? v.join(',') : String(v));
    }
    return this.get(`/v1/search?${qs}`);
  }

  /** Every page of a search, one event at a time. */
  async *searchAll(params: string | SearchParams, max = 200): AsyncGenerator<Event> {
    const p: SearchParams = typeof params === 'string' ? { q: params } : { ...params };
    let seen = 0;
    for (;;) {
      const page = await this.search({ limit: 50, ...p });
      for (const e of page.results) {
        yield e;
        if (++seen >= max) return;
      }
      if (page.next_offset == null) return;
      p.offset = page.next_offset;
    }
  }

  /** One event in full. */
  event(id: string): Promise<Event> {
    return this.get(`/v1/events/${encodeURIComponent(id)}`);
  }

  /** The metros and cities covered, and the categories. */
  coverage(): Promise<Coverage> {
    return this.get('/v1/coverage');
  }

  private async get<T>(path: string): Promise<T> {
    const res = await this.fetch(this.baseUrl + path, {
      headers: { accept: 'application/json', ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}) },
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const retry = Number(res.headers.get('retry-after')) || undefined;
      throw new ThingsToDoError(res.status, String(body.error ?? 'error'), String(body.message ?? res.statusText), retry);
    }
    return body as T;
  }
}

export default ThingsToDo;
