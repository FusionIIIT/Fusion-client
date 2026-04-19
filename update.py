import re

with open('src/Modules/Scholarship/components/MCMStudentDashboard.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'localStorage\.setItem\([\s\S]*?setApplyMessage\([^\)]+\);', re.MULTILINE)

replacement = '''submitMCMLinkApplication(applyForm).then(() => {
      setApplyMessageColor("green");
      setApplyMessage("Application submitted successfully.");
      setApplyForm(initialApplyForm);
      fetchApplications();
    }).catch((err) => {
      setApplyMessageColor("red");
      setApplyMessage("Failed to submit application. Please check backend connection.");
      console.error(err);
    });'''

new_text, count = pattern.subn(replacement, text)

with open('src/Modules/Scholarship/components/MCMStudentDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Replaced', count, 'instances.')
