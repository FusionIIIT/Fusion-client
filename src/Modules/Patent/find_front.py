import os
import re

frontend_path = r"C:\Users\tanay\OneDrive\Desktop\Fusion1\Fusioncode\Fusion-client\src\Modules\Patent"
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

print("Frontend checks:")
found_feats = set()
for root, dirs, files in os.walk(frontend_path):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            try:
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                    text = f.read()
                    for feat in features:
                        if re.search(feat, text, re.IGNORECASE):
                            found_feats.add(feat)
            except:
                pass
for feat in features:
     if feat in found_feats:
          print(f"FOUND: {feat}")
     else:
          print(f"NOT FOUND: {feat}")
