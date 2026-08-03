curl -s -o /dev/null -w "main: %{http_code}\n" http://localhost:5174/online-cms
curl -s -o /dev/null -w "course: %{http_code}\n" http://localhost:5174/online-cms/CS101
curl -s -o /dev/null -w "assignments: %{http_code}\n" http://localhost:5174/online-cms/CS101/assignments
curl -s -o /dev/null -w "forum: %{http_code}\n" http://localhost:5174/online-cms/CS101/forum
curl -s -o /dev/null -w "quiz: %{http_code}\n" http://localhost:5174/online-cms/CS101/quiz
curl -s -o /dev/null -w "attendance: %{http_code}\n" http://localhost:5174/online-cms/CS101/attendance
curl -s -o /dev/null -w "questionbank: %{http_code}\n" http://localhost:5174/online-cms/CS101/questionbank
curl -s -o /dev/null -w "grading: %{http_code}\n" http://localhost:5174/online-cms/CS101/grading
