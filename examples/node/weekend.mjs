// What's on, from the command line.
//   npm install thingstodo
//   node weekend.mjs "comedy in san francisco friday night"
import ThingsToDo from 'thingstodo';

const events = new ThingsToDo(); // THINGSTODO_API_KEY if set; without one, 50 calls a day
const q = process.argv.slice(2).join(' ') || 'things to do in san francisco this weekend';
const { query, results, message } = await events.search({ q, limit: 15 });

if (message) console.log(message);
const i = query.interpreted;
console.log([i.topic, i.place, i.when].filter(Boolean).join(' · '), '\n');
for (const e of results) {
  console.log(`${e.local.date} ${e.local.time ?? ''}  ${e.title}`);
  console.log(`  ${[e.venue?.name, e.venue?.city].filter(Boolean).join(', ')}${e.price ? ' · ' + e.price : ''}`);
  const link = e.links.tickets ?? e.links.source;
  if (link) console.log(`  ${link}`);
}
