"""Things To Do API client: search local events in plain words.

    from thingstodo import ThingsToDo
    events = ThingsToDo().search("jazz in san francisco this weekend")

Docs: https://thingstodoapi.com/docs/
"""

from .client import CATEGORIES, ThingsToDo, ThingsToDoError

__all__ = ["ThingsToDo", "ThingsToDoError", "CATEGORIES"]
__version__ = "0.1.0"
