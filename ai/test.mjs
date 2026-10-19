// Checks the tools against the live API, then runs them through generateText
// with a scripted model (no LLM key needed): the model calls searchEvents,
// the SDK runs it, and the model answers from the result.
import assert from 'node:assert/strict';
import { generateText, isStepCount } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { thingsToDoTools } from './dist/index.js';

const tools = thingsToDoTools();

const found = await tools.searchEvents.execute({ query: 'comedy in san francisco this weekend', limit: 3 }, { toolCallId: 't1', messages: [] });
assert.ok(Array.isArray(found.events), 'events');
assert.equal(found.interpreted.place, 'San Francisco');
console.log('searchEvents:', found.events.map((e) => e.title));

if (found.events[0]) {
  const one = await tools.getEvent.execute({ id: found.events[0].id }, { toolCallId: 't2', messages: [] });
  assert.equal(one.id, found.events[0].id);
  console.log('getEvent:', one.title, '@', one.venue?.name);
}
const cov = await tools.listCoverage.execute({}, { toolCallId: 't3', messages: [] });
assert.ok(cov.metros.length > 0);
console.log('listCoverage:', cov.metros.map((m) => m.name));

const outside = await tools.searchEvents.execute({ query: 'jazz in chicago tonight' }, { toolCallId: 't4', messages: [] });
assert.equal(outside.events.length, 0);
console.log('outside coverage:', outside.message);

const usage = { inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 }, outputTokens: { total: 1, text: 1, reasoning: 0 } };
let turn = 0;
const model = new MockLanguageModelV4({
  doGenerate: async ({ prompt }) => {
    turn++;
    if (turn === 1) {
      return {
        content: [{ type: 'tool-call', toolCallId: 'c1', toolName: 'searchEvents', input: JSON.stringify({ query: 'markets in oakland', limit: 2 }) }],
        finishReason: { unified: 'tool-calls', raw: 'tool_use' }, usage, warnings: [],
      };
    }
    const result = prompt.flatMap((m) => (Array.isArray(m.content) ? m.content : [])).find((p) => p.type === 'tool-result');
    const out = result.output.value;
    return { content: [{ type: 'text', text: `Found: ${out.events.map((e) => e.title).join('; ')}` }], finishReason: { unified: 'stop', raw: 'end_turn' }, usage, warnings: [] };
  },
});
const { text, steps } = await generateText({ model, tools, prompt: 'Any markets in Oakland coming up?', stopWhen: isStepCount(3) });
assert.equal(steps.length, 2);
console.log('generateText:', text);
console.log('ok');
