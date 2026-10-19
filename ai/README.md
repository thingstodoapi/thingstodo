# thingstodo-ai

[Things To Do API](https://thingstodoapi.com) as [AI SDK](https://ai-sdk.dev) tools:
let a model search local events in plain words and answer with real times,
venues and links.

```bash
npm install thingstodo-ai ai zod
```

```js
import { generateText, isStepCount } from 'ai';
import { thingsToDoTools } from 'thingstodo-ai';

const { text } = await generateText({
  model: 'anthropic/claude-opus-5.5',
  tools: thingsToDoTools(),
  stopWhen: isStepCount(5),
  prompt: 'Plan a Saturday in San Francisco: a market in the morning, live music at night.',
});

console.log(text);
```

## Tools

- `searchEvents`: plain words, with time and place read out of them; optional
  `place`, `near`, `from`, `to`, `categories`, `limit`, `offset`. Returns events
  with local times, venue, price and a link, and how the query was read.
- `getEvent`: one event in full, by the id a search returned.
- `listCoverage`: the cities covered and the categories.

`thingsToDoTools(options)` returns all three; each is also exported on its own
(`searchEvents(options)` and so on).

## Keys

Without a key, 50 calls a day. A [free key](https://thingstodoapi.com/signup/)
gives 1,000 a month: set `THINGSTODO_API_KEY`, or pass `{ apiKey }`.

Docs: [thingstodoapi.com/docs/ai-sdk](https://thingstodoapi.com/docs/ai-sdk/). MIT.
