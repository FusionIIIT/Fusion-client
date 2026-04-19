
import re
path = "MCMAssistantDashboard.jsx"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

# Replace all occurrences of the broken string
text = re.sub(r"await axios\.patch\(.*?,", "await axios.patch(`http://${host}/scholarships/api/mcm-applications/${appId}/`,", text)

with open(path, "w", encoding="utf-8") as f:
    f.write(text)
print("done")

