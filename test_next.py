import requests
import json

data = {
    "role": "Frontend Developer",
    "question": "Tell me about yourself",
    "answer": "I am a frontend developer.",
    "question_number": 1,
    "history": [],
    "stage": "intro"
}
try:
    res = requests.post("https://aiinterveiwsimulator-3.onrender.com/api/next", json=data)
    with open("test_output.json", "w") as f:
        json.dump(res.json(), f, indent=2)
except Exception as e:
    with open("test_output.json", "w") as f:
        f.write(str(e))
