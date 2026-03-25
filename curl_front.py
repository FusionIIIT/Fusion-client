import urllib.request
import sys

def get_code(url, prefix):
    try:
        res = urllib.request.urlopen(url)
        print(f"{prefix}: {res.status}")
    except Exception as e:
        print(f"{prefix}: {getattr(e, 'code', 'Error')}")

get_code('http://localhost:5173/online-cms', 'main page')
get_code('http://localhost:5173/online-cms/CS101', 'course home')
get_code('http://localhost:5173/online-cms/CS101/assignments', 'assignments')
get_code('http://localhost:5173/online-cms/CS101/forum', 'forum')
get_code('http://localhost:5173/online-cms/CS101/quiz', 'quiz')
