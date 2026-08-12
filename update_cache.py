import json
import os

path = ".codex/models_cache.json"
if not os.path.exists(path):
    print("File not found")
    exit(0)

with open(path, "r") as f:
    data = json.load(f)

if isinstance(data, list):
    for model in data:
        if isinstance(model, dict) and model.get("slug") == "gemma4:31b-cloud":
            model["default_verbosity"] = "high"
elif isinstance(data, dict):
    for key, value in data.items():
        if isinstance(value, dict) and value.get("slug") == "gemma4:31b-cloud":
            value["default_verbosity"] = "high"

with open(path, "w") as f:
    json.dump(data, f, indent=2)
