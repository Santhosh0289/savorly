import os

import requests
from flask import Blueprint, jsonify, request

assistant_bp = Blueprint("assistant", __name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-3.6-flash:generateContent"
)

SYSTEM_PROMPT = (
    "You are Savorly's in-house nutrition assistant. You give friendly, practical "
    "advice about healthy eating, calorie and protein intake, portion sizes, and how "
    "to build a balanced meal from Savorly's home-style menu (rice, curries, salads, "
    "grilled proteins, etc). Keep answers short and conversational — no more than 120 "
    "words, as a few sentences or a short bullet list, not an essay. You are not a "
    "doctor: for anything medical (allergies, conditions, medication interactions), "
    "tell the person to check with a doctor or dietitian rather than giving medical advice. "
    "Use plain text only: for lists, start each item with '- '. Do not use Markdown "
    "asterisks, backslashes, headings, or decorative formatting."
)


@assistant_bp.route("/chat", methods=["POST"])
def chat():
    if not GEMINI_API_KEY:
        return jsonify({"error": "AI assistant is not configured on the server."}), 503

    data = request.get_json()
    messages = data.get("messages", [])  # [{role: "user"|"assistant", content: "..."}]

    # Gemini uses "user"/"model" roles and a "contents" array, not OpenAI-style "messages".
    contents = []
    for message in messages:
        role = "model" if message["role"] == "assistant" else "user"
        contents.append({"role": role, "parts": [{"text": message["content"]}]})

    payload = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024},
    }

    try:
        response = requests.post(
            GEMINI_URL,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
            },
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        parts = result["candidates"][0]["content"]["parts"]
        reply = "".join(
            part.get("text", "")
            for part in parts
            if not part.get("thought", False)
        ).strip()
        if not reply:
            raise KeyError("No visible response text")
        return jsonify({"reply": reply})
    except requests.exceptions.RequestException:
        return jsonify({"error": "AI assistant is temporarily unavailable."}), 502
    except (KeyError, IndexError):
        return jsonify({"error": "AI assistant couldn't generate a response. Try rephrasing."}), 502
