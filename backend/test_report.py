import requests

data = {
    "role": "Backend Developer",
    "sessions": [{"question": "Test", "answer": "Test", "feedback": {}}]
}
try:
    response = requests.post("http://localhost:5000/api/report", json=data)
    print("Status code:", response.status_code)
    print(response.json())
except Exception as e:
    print(e)
