# thingstodo

A Python client for the [Things To Do API](https://thingstodoapi.com): search local
events in plain words. No dependencies; Python 3.9+.

```bash
pip install thingstodo
```

```python
from thingstodo import ThingsToDo

events = ThingsToDo()  # or ThingsToDo(api_key=...); reads THINGSTODO_API_KEY
page = events.search("comedy friday night in san francisco")

for e in page["results"]:
    print(e["local"]["date"], e["local"]["time"], e["title"], "@", (e["venue"] or {}).get("name"))
```

Without a key you get 50 calls a day; a [free key](https://thingstodoapi.com/signup/)
gives 1,000 a month.

## API

- `search(q, *, place, lat, lng, km, start, end, category, limit, offset, sort)`:
  returns `{"query", "results", "next_offset", "message"?}`. `start`/`end` are ISO 8601
  (the API's `from`/`to`); `category` takes a string or a list.
- `search_all(q, *, max=200, **filters)`: every page, one event at a time.
- `event(id)`: one event in full.
- `coverage()`: the metros, cities and categories.

Errors raise `ThingsToDoError` with `.status`, `.code` (`rate_limited`,
`quota_exceeded`, `not_found`…) and `.retry_after`.

Docs: [thingstodoapi.com/docs](https://thingstodoapi.com/docs/). MIT.
