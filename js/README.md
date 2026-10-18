# thingstodo

A typed client for the [Things To Do API](https://thingstodoapi.com): search local
events in plain words. No dependencies; Node 18+, Deno, Bun and browsers.

```bash
npm install thingstodo
```

```js
import ThingsToDo from 'thingstodo';

const events = new ThingsToDo(); // or { apiKey }; reads THINGSTODO_API_KEY
const { results } = await events.search('comedy friday night in san francisco');

for (const e of results) {
  console.log(e.local.date, e.local.time, e.title, '@', e.venue?.name);
}
```

Without a key you get 50 calls a day; a [free key](https://thingstodoapi.com/signup/)
gives 1,000 a month.

## API

- `search(q)` or `search({ q, place, lat, lng, km, from, to, category, limit, offset, sort })`:
  returns `{ query, results, next_offset, message? }`. `query.interpreted` says how the
  words were read. `message` is set when a place isn't covered.
- `searchAll(params, max = 200)`: every page, as an async iterator.
- `event(id)`: one event in full.
- `coverage()`: the metros, cities and categories.

Errors throw `ThingsToDoError` with `status`, `code` (`rate_limited`,
`quota_exceeded`, `not_found`…) and `retryAfter` in seconds when given.

Docs: [thingstodoapi.com/docs](https://thingstodoapi.com/docs/). MIT.
