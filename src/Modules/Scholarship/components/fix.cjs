const fs = require('fs');
const filepath = './MCMAssistantDashboard.jsx';
let content = fs.readFileSync(filepath, 'utf8');

const correctBlock = "      await axios.patch(`http://${host}/scholarships/api/mcm-applications/${appId}/`, {\n" +
"        status: newStatus\n" +
"      }, {\n" +
"        headers: {\n" +
"          Authorization: `Token ${token}`\n" +
"        }\n" +
"      });\n" +
"      \n" +
"      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));\n" +
"      alert(`Application marked as ${newStatus}!`);";

content = content.replace(/await axios\.patch\([\s\S]*?alert\([^\)]*\);/, correctBlock);

fs.writeFileSync(filepath, content);
