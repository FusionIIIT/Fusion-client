import urllib.request
import time

urls = [
    "http://localhost:5173/",
    "http://localhost:5173/online-cms",
    "http://localhost:5173/online-cms/CS101",
    "http://localhost:5173/online-cms/CS101/assignments"
]

time.sleep(2) # Give it an extra moment

for url in urls:
    try:
        response = urllib.request.urlopen(url)
        print(f"{url} -> Status {response.status}")
    except Exception as e:
        print(f"{url} -> Error: {e}")

