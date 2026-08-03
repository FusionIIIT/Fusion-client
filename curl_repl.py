import urllib.request
import sys

def get_code(url, prefix):
    try:
        res = urllib.request.urlopen(url)
        print(f"{prefix}: {res.status}")
    except Exception as e:
        print(f"{prefix}: {getattr(e, 'code', 'Error')}")

get_code('http://localhost:8000/ocms/api/courses/', 'courses')
get_code('http://localhost:8000/ocms/api/CS101/dashboard/', 'dashboard')
get_code('http://localhost:8000/ocms/api/CS101/assignments/', 'assignments')
get_code('http://localhost:8000/ocms/api/CS101/documents/', 'documents')
get_code('http://localhost:8000/ocms/api/CS101/forum/', 'forum')
get_code('http://localhost:8000/ocms/api/CS101/quizzes/', 'quizzes')
get_code('http://localhost:8000/ocms/api/CS101/questionbank/', 'questionbank')
get_code('http://localhost:8000/ocms/api/CS101/grading/', 'grading')
