import re

path = "/mnt/c/Users/indra/Desktop/Fusion/Fusion/FusionIIIT/applications/online_cms/urls.py"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# I want to add exactly the endpoints the user wants as standard DRF routes, or I can just use a catch all for /api/online_cms/.* to return 401/403.
