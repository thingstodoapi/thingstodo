from __future__ import annotations

import json
import os
from typing import Any, Dict, Iterator, Sequence, Union
from urllib.error import HTTPError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

CATEGORIES = (
    "music", "arts", "social", "festival", "market",
    "popup", "supper_club", "exhibition", "class", "sports",
)

Event = Dict[str, Any]
"""An event: id, title, category, starts_at/ends_at (UTC), local {date, time,
timezone}, venue {name, address, neighborhood, city, lat, lng}, summary, tags,
price, links {source, tickets}, last_verified."""


class ThingsToDoError(Exception):
    def __init__(self, status: int, code: str, message: str, retry_after: int | None = None):
        super().__init__(message)
        self.status, self.code, self.retry_after = status, code, retry_after


class ThingsToDo:
    """A client for https://api.thingstodoapi.com.

    api_key: a key from https://thingstodoapi.com/signup/ (defaults to
    THINGSTODO_API_KEY). Without one, 50 calls a day.
    """

    def __init__(self, api_key: str | None = None, base_url: str = "https://api.thingstodoapi.com", timeout: float = 30):
        self.api_key = api_key or os.environ.get("THINGSTODO_API_KEY")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def search(
        self,
        q: str | None = None,
        *,
        place: str | None = None,
        lat: float | None = None,
        lng: float | None = None,
        km: float | None = None,
        start: str | None = None,
        end: str | None = None,
        category: Union[str, Sequence[str], None] = None,
        limit: int | None = None,
        offset: int | None = None,
        sort: str | None = None,
    ) -> dict[str, Any]:
        """Search events. Time and place in `q` are understood ("comedy friday
        night in the mission"); or pass place, lat/lng/km, start/end (ISO 8601)
        and category. Returns {query, results, next_offset, message?}."""
        if isinstance(category, (list, tuple)):
            category = ",".join(category)
        params = {"q": q, "place": place, "lat": lat, "lng": lng, "km": km, "from": start, "to": end,
                  "category": category, "limit": limit, "offset": offset, "sort": sort}
        return self._get("/v1/search?" + urlencode({k: v for k, v in params.items() if v not in (None, "")}))

    def search_all(self, q: str | None = None, *, max: int = 200, **kwargs: Any) -> Iterator[Event]:
        """Every page of a search, one event at a time, up to `max`."""
        kwargs.setdefault("limit", 50)
        seen = 0
        while True:
            page = self.search(q, **kwargs)
            for event in page["results"]:
                yield event
                seen += 1
                if seen >= max:
                    return
            if page.get("next_offset") is None:
                return
            kwargs["offset"] = page["next_offset"]

    def event(self, id: str) -> Event:
        """One event in full."""
        return self._get("/v1/events/" + quote(id, safe=""))

    def coverage(self) -> dict[str, Any]:
        """The metros and cities covered, and the categories."""
        return self._get("/v1/coverage")

    def _get(self, path: str) -> Any:
        headers = {"accept": "application/json", "user-agent": "thingstodo-python/0.1.0"}
        if self.api_key:
            headers["authorization"] = f"Bearer {self.api_key}"
        try:
            with urlopen(Request(self.base_url + path, headers=headers), timeout=self.timeout) as res:
                return json.load(res)
        except HTTPError as e:
            try:
                body = json.load(e)
            except ValueError:
                body = {}
            retry = e.headers.get("retry-after")
            raise ThingsToDoError(e.code, body.get("error", "error"), body.get("message", e.reason),
                                  int(retry) if retry and retry.isdigit() else None) from None
