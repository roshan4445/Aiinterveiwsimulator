import requests

try:
    print("Testing /start...")
    res = requests.post("https://aiinterveiwsimulator-3.onrender.com/api/start", json={"role": "Backend Engineer"})
    print("Status:", res.status_code)
    try:
        print(res.json())
    except Exception:
        print(res.text[:500])
except Exception as e:
    print("Error:", e)
