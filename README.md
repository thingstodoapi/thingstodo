# Things To Do API

Search local events in plain words, and get them back as clean JSON:
concerts, comedy, pop-ups, markets, supper clubs, classes, gallery nights.
Over REST or as an MCP server, so an agent can use it directly.

```bash
curl "https://api.thingstodoapi.com/v1/search?q=jazz+in+san+francisco+this+weekend"
```

No key needed to try it (50 calls a day). A [free key](https://thingstodoapi.com/signup/)
gives 1,000 calls a month. Docs: [thingstodoapi.com/docs](https://thingstodoapi.com/docs/).

## What you get back

The time and place are read out of the words ("comedy friday night in the
mission"), and the response says how it read them:

```json
{
  "query": { "interpreted": { "topic": "jazz", "place": "San Francisco", "when": "this weekend" } },
  "results": [
    {
      "title": "Swing in Union Sq with Silver Bell Jazz Band",
      "category": "music",
      "starts_at": "2026-10-17T00:00:00.000Z",
      "local": { "date": "2026-10-16", "time": "5:00 PM", "timezone": "America/Los_Angeles" },
      "venue": { "name": "Union Square", "address": "501 Geary Street", "city": "San Francisco", "lat": 37.7867, "lng": -122.4117 },
      "price": "Free",
      "links": { "source": "https://…", "tickets": null }
    }
  ],
  "next_offset": 20
}
```

Narrow it with `place`, `lat`/`lng`/`km`, `from`/`to` and `category` (music,
arts, social, festival, market, popup, supper_club, exhibition, class,
sports). Which cities are covered: `GET /v1/coverage`.

## In this repo

| | |
|---|---|
| [`js/`](js) | `npm install thingstodo`: a typed client for Node, Deno, Bun and browsers |
| [`ai/`](ai) | `npm install thingstodo-ai`: the API as Vercel AI SDK tools |
| [`python/`](python) | `pip install thingstodo`: a Python client with no dependencies |
| [`examples/mcp`](examples/mcp) | Connect it to Claude, Cursor or any MCP client |
| [`examples/python-agent`](examples/python-agent) | A weekend-planner agent with Claude, two ways: a tool, or the MCP connector |
| [`examples/browser`](examples/browser) | "Events near me" in one HTML file, no build |
| [`examples/node`](examples/node) | What's on, from the command line |

## MCP

```bash
claude mcp add --transport http thingstodo https://api.thingstodoapi.com/mcp
```

In the [official MCP Registry](https://registry.modelcontextprotocol.io) as
`com.thingstodoapi/events`. Tools: `search_events`, `get_event`, `list_coverage`.

## License

The clients and examples are MIT. Use of the API is under the
[terms](https://thingstodoapi.com/terms/).
