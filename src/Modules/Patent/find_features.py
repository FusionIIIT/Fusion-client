import os
import re

backend_path = r"C:\Users\tanay\OneDrive\Desktop\Fusion1\Fusioncode\Fusion\FusionIIIT\applications\patent_system\services.py"
with open(backend_path, 'r', encoding='utf-8') as f:
    text = f.read()

features = [
    "director",
    "coi", "conflict",
    "budget", "financial",
    "office action",
    "post_grant", "maintenance",
    "deadline", "alert",
    "licens", "tech transfer",
    "audit"
]

print("Backend checks:")
for feat in features:
    if re.search(feat, text, re.IGNORECASE):
         print(f"FOUND: {feat}")
    else:
         print(f"NOT FOUND: {feat}")
