import requests

# Test the login endpoint
url = "http://127.0.0.1:8000/api/login"
data = {
    "username": "admin",
    "password": "password"
}

response = requests.post(url, data=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("✅ Login successful!")
    token = response.json().get("token")
    print(f"Token: {token[:50]}..." if token else "No token received")
else:
    print("❌ Login failed!") 