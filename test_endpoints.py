import urllib.request
import urllib.error
import urllib.parse
import json

base_url = "http://127.0.0.1:8000/api/online_cms"

endpoints = [
    "/courses/",
    "/courses/CS101/",
    "/courses/CS101/documents/",
    "/courses/CS101/videos/",
    "/courses/CS101/assignments/",
    "/courses/CS101/quizzes/",
    "/courses/CS101/forum/",
    "/courses/CS101/attendance/",
    "/courses/CS101/question-bank/",
    "/courses/CS101/grading/"
]

def test_endpoint(path, method="GET", payload=None):
    url = f"{base_url}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    if payload:
        req.data = json.dumps(payload).encode('utf-8')
        
    try:
        response = urllib.request.urlopen(req)
        print(f"[{method}] {path} -> {response.status}")
    except urllib.error.HTTPError as e:
        print(f"[{method}] {path} -> {e.code}")
    except Exception as e:
        print(f"[{method}] {path} -> Error: {e}")

for ep in endpoints:
    test_endpoint(ep)
