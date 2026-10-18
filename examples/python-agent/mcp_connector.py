"""The same idea with no tool code: Claude connects to the Things To Do MCP
server itself, through the Messages API's MCP connector.

    pip install anthropic
    python mcp_connector.py "what's on in oakland tonight?"
"""

import os
import sys

import anthropic

client = anthropic.Anthropic()

server = {"type": "url", "url": "https://api.thingstodoapi.com/mcp", "name": "thingstodo"}
if os.environ.get("THINGSTODO_API_KEY"):  # optional: without a key, 50 calls a day
    server["authorization_token"] = os.environ["THINGSTODO_API_KEY"]

response = client.beta.messages.create(
    model="claude-opus-5-5",
    max_tokens=16000,
    output_config={"effort": "medium"},
    betas=["mcp-client-2025-11-20", "server-side-fallback-2026-07-01"],
    fallbacks="default",
    mcp_servers=[server],
    tools=[{"type": "mcp_toolset", "mcp_server_name": "thingstodo"}],
    messages=[{"role": "user", "content": " ".join(sys.argv[1:]) or "What's on in San Francisco this weekend?"}],
)
if response.stop_reason == "refusal":
    sys.exit("No answer came back.")
print("".join(block.text for block in response.content if block.type == "text"))
