import os

import requests


TWOFACTOR_API_KEY = os.getenv("TWOFACTOR_API_KEY")


def send_otp(phone, code, channel="sms"):
    clean_phone = phone.replace("+91", "").replace(" ", "").strip()
    if not TWOFACTOR_API_KEY:
        raise RuntimeError("TWOFACTOR_API_KEY is not configured")

    if channel == "voice":
        url = f"https://2factor.in/API/V1/{TWOFACTOR_API_KEY}/VOICE/{clean_phone}/{code}"
        endpoint = "VOICE/{phone}/{otp}"
        response = requests.get(url, timeout=15)
    else:
        url = f"https://2factor.in/API/V1/{TWOFACTOR_API_KEY}/SMS/{clean_phone}/{code}"
        endpoint = "SMS/{phone}/{otp}"
        response = requests.post(url, timeout=15)
    print(f"DEBUG - channel received: {channel!r} | 2Factor endpoint: {endpoint} | phone ending: {clean_phone[-4:]}")
    try:
        result = response.json()
    except ValueError:
        result = {"Details": response.text}

    if result.get("Status") != "Success":
        raise RuntimeError(result.get("Details") or f"HTTP {response.status_code}: {response.text}")
    return result
