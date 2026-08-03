with open("/mnt/c/Users/indra/Desktop/Fusion/Fusion-client/src/components/sidebarContent.jsx", "r") as f:
    text = f.read()
if '"course_management"' not in text:
    text = text.replace('"mess_management",', '"mess_management",\n    "course_management",')
with open("/mnt/c/Users/indra/Desktop/Fusion/Fusion-client/src/components/sidebarContent.jsx", "w") as f:
    f.write(text)
