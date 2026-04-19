import os

filepath = 'MCMAssistantDashboard.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'await axios\.patch\(.*?,', 'await axios.patch(http://System.Management.Automation.Internal.Host.InternalHost/scholarships/api/mcm-applications//,', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
