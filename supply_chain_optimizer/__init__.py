import sys
from importlib.util import spec_from_file_location, module_from_spec

_ROOT = __file__.rsplit("/", 1)[0] + "/.."
_MODULE_PATH = f"{_ROOT}/supply_chain_optimizer.py"
_spec = spec_from_file_location("_legacy_supply_chain_optimizer", _MODULE_PATH)
_legacy = module_from_spec(_spec)
_spec.loader.exec_module(_legacy)

Warehouse = _legacy.Warehouse
Order = _legacy.Order
Connection = _legacy.Connection
DemandForecaster = _legacy.DemandForecaster
InventoryOptimizer = _legacy.InventoryOptimizer
RouteOptimizer = _legacy.RouteOptimizer
SupplyChainOptimizer = _legacy.SupplyChainOptimizer

__all__ = [
    "Warehouse",
    "Order",
    "Connection",
    "DemandForecaster",
    "InventoryOptimizer",
    "RouteOptimizer",
    "SupplyChainOptimizer",
]
