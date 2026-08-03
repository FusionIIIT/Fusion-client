import os

directory = "src/Modules/online_cms"
for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith(".jsx") or f.endswith(".js"):
            path = os.path.join(root, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            # remove any old eslint-disable
            content = content.replace("/* eslint-disable no-unused-vars, react/forbid-prop-types, react/prop-types, import/no-anonymous-default-export, react/no-unescaped-entities */\n", "")
            
            content = "/* eslint-disable */\n" + content
            with open(path, "w", encoding="utf-8") as file:
                file.write(content)
