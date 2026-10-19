// Things To Do API as AI SDK tools: let a model search local events.
// Docs: https://thingstodoapi.com/docs/ai-sdk/
import { tool } from 'ai';
import { z } from 'zod';
import { CATEGORIES, ThingsToDo, type ClientOptions, type Event } from 'thingstodo';

export type ThingsToDoToolOptions = ClientOptions;

/** The fields a model needs to answer, so tool results stay small. */
function brief(e: Event) {
  const venue = e.venue ?? null;
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    when: [e.local.date, e.local.time].filter(Boolean).join(' '),
    timezone: e.local.timezone,
    ongoing: e.ongoing ?? false,
    venue: venue && { name: venue.name, address: venue.address, city: venue.city, lat: venue.lat, lng: venue.lng },
    price: e.price,
    summary: e.summary,
    link: e.links.tickets ?? e.links.source,
  };
}

/** Search local events in plain words. */
export function searchEvents(options: ThingsToDoToolOptions = {}) {
  const client = new ThingsToDo(options);
  return tool({
    description:
      'Find events happening in a city: concerts, comedy, theater, club nights, pop-ups, supper clubs, markets, ' +
      'festivals, classes, exhibitions. Pass what the user asked for in plain words as `query`; time and place in ' +
      'the words are understood ("jazz this weekend in Oakland", "markets sunday morning"). Returns events with ' +
      'local times, venue, price and a link, plus how the query was read. If a place is not covered, `message` says so.',
    inputSchema: z.object({
      query: z.string().describe('What to find, in plain words. May include when and where.'),
      place: z.string().optional().describe('A city or neighborhood by name, when known exactly.'),
      near: z
        .object({ lat: z.number(), lng: z.number(), km: z.number().optional().describe('Radius, default 5.') })
        .optional()
        .describe('Search around a point instead of a named place.'),
      from: z.string().optional().describe('ISO 8601 start of the window. Overrides any time in the query.'),
      to: z.string().optional().describe('ISO 8601 end of the window.'),
      categories: z.array(z.enum(CATEGORIES)).optional().describe('Only these categories.'),
      limit: z.number().int().min(1).max(50).optional().describe('How many events, default 10.'),
      offset: z.number().int().min(0).optional().describe('For the next page: the nextOffset a search returned.'),
    }),
    execute: async ({ query, place, near, from, to, categories, limit, offset }) => {
      const page = await client.search({
        q: query, place, from, to, offset,
        lat: near?.lat, lng: near?.lng, km: near?.km,
        category: categories,
        limit: limit ?? 10,
      });
      return {
        interpreted: page.query.interpreted,
        ...(page.message ? { message: page.message } : {}),
        events: page.results.map(brief),
        nextOffset: page.next_offset,
      };
    },
  });
}

/** One event in full, by the id a search returned. */
export function getEvent(options: ThingsToDoToolOptions = {}) {
  const client = new ThingsToDo(options);
  return tool({
    description: 'Everything known about one event, by the id from searchEvents: tags, venue, links and times.',
    inputSchema: z.object({ id: z.string().describe('The event id from searchEvents.') }),
    execute: async ({ id }) => client.event(id),
  });
}

/** The metros and cities covered, and the categories. */
export function listCoverage(options: ThingsToDoToolOptions = {}) {
  const client = new ThingsToDo(options);
  return tool({
    description: 'The cities covered and the event categories. Call it when unsure whether a place is covered.',
    inputSchema: z.object({}),
    execute: async () => client.coverage(),
  });
}

/** All three tools, ready to pass as `tools`. */
export function thingsToDoTools(options: ThingsToDoToolOptions = {}) {
  return { searchEvents: searchEvents(options), getEvent: getEvent(options), listCoverage: listCoverage(options) };
}
