"""
Minimal CrewAI Flow SDK
========================
Lightweight replacement for `crewai.Flow` that supports:
- @start()  : entry-point node
- @router() : dynamic branching node
- @listen() : leaf/handler node

This avoids pulling the full crewai stack during local development.
"""
from __future__ import annotations

import functools
from typing import Any, Callable, Dict, List, Optional, Type, Union

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Decorators
# ---------------------------------------------------------------------------

_START_MARKER = "__crewai_start__"
_ROUTER_MARKER = "__crewai_router__"
_LISTEN_MARKER = "__crewai_listen__"


def start(func: Optional[Callable] = None) -> Callable:
    """Mark a method as the flow's entry point.
    
    Supports both @start and @start() usage.
    """
    if func is not None:
        # Used as @start without parentheses
        setattr(func, _START_MARKER, True)
        return func
    
    # Used as @start() with parentheses
    def decorator(f: Callable) -> Callable:
        setattr(f, _START_MARKER, True)
        return f
    return decorator


def router(func: Optional[Callable] = None) -> Callable:
    """Mark a method as a dynamic router that returns a branch name.
    
    Supports both @router and @router() usage.
    """
    if func is not None:
        setattr(func, _ROUTER_MARKER, True)
        return func
    
    def decorator(f: Callable) -> Callable:
        setattr(f, _ROUTER_MARKER, True)
        return f
    return decorator


def listen(branch: Optional[Union[str, Callable]] = None) -> Callable:
    """Mark a method as a handler for a router branch.
    
    Supports both @listen and @listen("branch_name") usage.
    """
    if callable(branch):
        # Used as @listen without parentheses
        func = branch
        setattr(func, _LISTEN_MARKER, func.__name__)
        return func
    
    # Used as @listen("branch_name") with parentheses
    def decorator(func: Callable) -> Callable:
        resolved = branch or func.__name__
        setattr(func, _LISTEN_MARKER, resolved)
        return func
    return decorator


# ---------------------------------------------------------------------------
# Base Flow
# ---------------------------------------------------------------------------

class Flow:
    """Minimal CrewAI-style Flow with state management.

    Usage:
        class MyFlow(Flow[MyState]):
            @start()
            def classify(self, data): ...

            @router()
            def route(self, state): ...

            @listen()
            def handle_gmail(self, state): ...
    """

    state_type: Type[BaseModel]

    def __init__(self, *, name: str = "", description: str = "", **kwargs: Any):
        self.name = name
        self.description = description
        self._starts: List[str] = []
        self._routers: List[str] = []
        self._listeners: Dict[str, str] = {}  # method_name -> branch

        for attr_name in dir(self):
            attr = getattr(self, attr_name, None)
            if callable(attr):
                if getattr(attr, _START_MARKER, False):
                    self._starts.append(attr_name)
                if getattr(attr, _ROUTER_MARKER, False):
                    self._routers.append(attr_name)
                branch = getattr(attr, _LISTEN_MARKER, None)
                if branch is not None:
                    self._listeners[attr_name] = branch

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run(self, *args: Any, **kwargs: Any) -> Any:
        """Execute the flow starting from the @start() node."""
        if not self._starts:
            raise RuntimeError("Flow has no @start() node")

        start_name = self._starts[0]
        start_fn = getattr(self, start_name)
        state = start_fn(*args, **kwargs)

        if self._routers:
            router_name = self._routers[0]
            router_fn = getattr(self, router_name)
            branch = router_fn(state)

            handler_name = self._resolve_listener(branch)
            if handler_name:
                handler_fn = getattr(self, handler_name)
                return handler_fn(state)

        return state

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _resolve_listener(self, branch: str) -> Optional[str]:
        """Find the @listen() method for the given branch."""
        for method_name, listener_branch in self._listeners.items():
            if listener_branch == branch:
                return method_name
        return None
