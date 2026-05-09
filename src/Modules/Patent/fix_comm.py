import os

fp = r"C:\Users\tanay\OneDrive\Desktop\Fusion1\Fusioncode\Fusion-client\src\Modules\Patent\components\PCCAdmin\ManageAttorney\CommunicationLogs.jsx"
with open(fp, "r", encoding="utf-8") as f:
    text = f.read()

# Replace the applications fetching code
old_code = """        const ongoingApps = ongoingRes.data.applications || [];
        const newApps = newRes.data.applications || [];
        const allApps = [...newApps, ...ongoingApps];"""

new_code = """        const ongoingData = ongoingRes.data.applications || [];
        const newData = newRes.data.applications || [];
        
        const ongoingApps = Array.isArray(ongoingData) 
          ? ongoingData 
          : Object.entries(ongoingData).map(([id, app]) => ({ application_id: parseInt(id), ...app }));
          
        const newApps = Array.isArray(newData) 
          ? newData 
          : Object.entries(newData).map(([id, app]) => ({ application_id: parseInt(id), ...app }));
          
        const allApps = [...newApps, ...ongoingApps];"""

if old_code in text:
    text = text.replace(old_code, new_code)
    with open(fp, "w", encoding="utf-8") as f:
        f.write(text)
    print("CommunicationLogs.jsx patched!")
else:
    print("Could not find the target code in CommunicationLogs.jsx")
