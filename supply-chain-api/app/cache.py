"""Simple in-memory cache for API responses and computation results.

Uses cachetools for LRU caching with configurable TTL.
Falls back gracefully if cachetools unavailable.
"""
from __future__ import annotations

import time
from typing import Any, Optional

try:
    from cachetools import TTLCache, cached, initialize
    _HAVE_CACHETOOLS = True
except ImportError:
    _HAVE_CACHETOOLS = False


class SimpleCache:
    """Basic cache wrapper that works with or without cachetools."""

    def __init__(self, maxsize: int = 128, ttl: float = 300):
        self._ttl = ttl
        self._store: dict[str, dict[str, Any]] = {}
        self._maxsize = maxsize

        if _HAVE_CACHETOOLS:
            self._cache = TTLCache(maxsize=maxsize, ttl=ttl)
        else:
            self._cache = self._store  # type: ignore[assignment]

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a cached value, or None if not found/expired."""
        if _HAVE_CACHETOOLS:
            return self._cache.get(key)

        entry = self._store.get(key)
        if entry is None:
            return None

        # Manual TTL check
        if time.time() - entry["timestamp"] > self._ttl:
            del self._store[key]
            return None

        return entry["value"]

    def set(self, key: str, value: Any) -> None:
        """Store a value in cache with timestamp."""
        if _HAVE_CACHETOOLS:
            self._cache[key] = value
        else:
            self._store[key] = {"value": value, "timestamp": time.time()}

    def invalidate(self, key: str) -> None:
        """Remove a specific key from cache."""
        self._cache.pop(key, None)

    def clear(self) -> None:
        """Clear entire cache."""
        self._cache.clear()


# Module-level convenience cache instances
_inventory_cache = SimpleCache(maxsize=256, ttl=600)
_route_cache = SimpleCache(maxsize=128, ttl=120)
_forecast_cache = SimpleCache(maxsize=64, ttl=180)


def get_inventory_cache() -> SimpleCache:
    return _inventory_cache


def get_route_cache() -> SimpleCache:
    return _route_cache


def get_forecast_cache() -> SimpleCache:
    return _forecast_cache


def cached_inventory(ttl: int = 600):
    """Decorator for caching inventory optimization results."""
    def decorator(func):
        if _HAVE_CACHETOOLS:
            from cachetools import cached as ttl_cached

            return ttl_cached(ttl=ttl)(func)
        return func
    return decorator


def cached_route(ttl: int = 120):
    """Decorator for caching route optimization results."""
    def decorator(func):
        if _HAVE_CACHETOOLS:
            from cachetools import cached as ttl_cached

            return ttl_cached(ttl=ttl)(func)
        return func
    return decorator


def cached_forecast(ttl: int = 180):
    """Decorator for caching demand forecast results."""
    def decorator(func):
        if _HAVE_CACHETOOLS:
            from cachetools import cached as ttl_cached

            return ttl_cached(ttl=ttl)(func)
        return func
    return decorator


def clear_all_caches() -> None:
    """Clear all module-level caches."""
    _inventory_cache.clear()
    _route_cache.clear()
    _forecast_cache.clear()


__all__ = [
    "SimpleCache",
    "get_inventory_cache",
    "get_route_cache",
    "get_forecast_cache",
    "cached_inventory",
    "cached_route",
    "cached_forecast",
    "clear_all_caches",
]