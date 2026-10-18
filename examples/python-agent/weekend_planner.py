"""A weekend planner: Claude searches real events and builds a plan.

    pip install anthropic thingstodo
    python weekend_planner.py "a fun saturday in san francisco, live music at night"

Uses ANTHROPIC_API_KEY, and THINGSTODO_API_KEY if set (without it, 50
searches a day).
"""

import sys

import anthropic
from anthropic import beta_tool
from thingstodo import ThingsToDo

events = ThingsToDo()
client = anthropic.Anthropic()


@beta_tool
def search_events(query: str, limit: int = 15) -> str:
    """Search local events in plain words. Put what, when and where in the query,
    e.g. "jazz in oakland saturday night" or "markets this weekend".

    Args:
        query: What, when and where, in plain words.
        limit: How many events to return, up to 50.
    """
    page = events.search(query, limit=limit)
    if page.get("message"):
        return page["message"]
    lines = []
    for e in page["results"]:
        venue = e.get("venue") or {}
        link = e["links"].get("tickets") or e["links"].get("source") or ""
        lines.append(" | ".join([
            f"{e['local']['date']} {e['local'].get('time') or ''}".strip(),
            e["title"],
            ", ".join(x for x in (venue.get("name"), venue.get("city")) if x),
            e.get("price") or "price not listed",
            link,
        ]))
    return "\n".join(lines) or "No events matched."


def main() -> None:
    request = " ".join(sys.argv[1:]) or "Plan me a fun Saturday in San Francisco with live music at night."
    runner = client.beta.messages.tool_runner(
        model="claude-opus-5-5",
        max_tokens=16000,
        output_config={"effort": "medium"},
        # If the model declines, the API retries on a fallback model in the same call.
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        system=(
            "You plan outings. Search for events before suggesting any, and suggest only "
            "events the search returned, each with its day, time, venue and link."
        ),
        tools=[search_events],
        messages=[{"role": "user", "content": request}],
    )
    final = None
    for message in runner:  # one message per turn; the runner calls search_events for Claude
        final = message
    if final is None or final.stop_reason == "refusal":
        sys.exit("No plan came back.")
    print("".join(block.text for block in final.content if block.type == "text"))


if __name__ == "__main__":
    main()
