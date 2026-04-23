import os
import re

fp = r"C:\Users\tanay\OneDrive\Desktop\Fusion1\Fusioncode\Fusion-client\src\Modules\Patent\components\PCCAdmin\PCCAStatusView.jsx"
with open(fp, "r", encoding="utf-8") as f:
    text = f.read()

old_code = """  const getStepIndex = (status) => {
    if (status === "Rejected") return -1;
    return statuses.findIndex((s) => s === status);
  };

  const currentStep = getStepIndex(currentStatus);
  const isRejected = currentStatus === "Rejected";"""

new_code = """  const getStepIndex = (status) => {
    switch (status) {
      case "Submitted":
      case "Resubmitted":
        return 0;
      case "Reviewed by PCC Admin":
        return 1;
      case "Forwarded for Director's Review":
      case "Forwarded to Director":
      case "Under Review":
        return 2;
      case "Director's Approval Received":
      case "Approved":
        return 3;
      case "Patentability Check":
      case "Patentability Check Started":
      case "Patentability Check Completed":
        return 4;
      case "Search Report Generated":
      case "Patentability Search Report Generated":
        return 5;
      case "Patent Filed":
      case "Patent Published":
      case "Patent Granted":
        return 6;
      case "Rejected":
      case "Patent Refused":
      case "Appeal Rejected":
        return -1;
      default:
        // Try finding if it loosely matches
        const idx = statuses.findIndex((s) => s === status);
        return idx !== -1 ? idx : 0;
    }
  };

  const currentStep = getStepIndex(currentStatus);
  const isRejected = currentStep === -1;"""

if old_code in text:
    text = text.replace(old_code, new_code)
    with open(fp, "w", encoding="utf-8") as f:
        f.write(text)
    print("PCCAStatusView.jsx patched!")
else:
    print("Could not find the target code in PCCAStatusView.jsx")
