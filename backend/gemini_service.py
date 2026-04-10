"""
Gemini API integration: quiz judging (with format builder) and content personalization.
Uses the google-genai SDK (v1.0+).
"""
import os
import json
import re
import traceback

from gemini_prompts import (
    QUIZ_JUDGE_SYSTEM,
    build_quiz_judge_user_prompt,
    BUILDER_VALIDATOR_SYSTEM,
    build_personalization_system_prompt,
    build_personalization_user_prompt,
)
try:
    from google import genai
    from google.genai import types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

_client = None

def get_client():
    global _client
    if _client is not None:
        return _client

    if not GENAI_AVAILABLE:
        raise ImportError("google-genai package is not installed. Run: pip install google-genai")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment")

    _client = genai.Client(api_key=api_key)
    return _client


def _parse_judge_json(raw: str, expected_len: int) -> list[dict]:
    """Parse judge JSON output; returns list of { marks, suggestion }."""
    raw = raw.strip()
    match = re.search(r"\[.*\]", raw, re.DOTALL)
    if match:
        try:
            arr = json.loads(match.group())
            if isinstance(arr, list):
                out = []
                for i in range(expected_len):
                    if i < len(arr) and isinstance(arr[i], dict):
                        item = arr[i]
                        marks = item.get("marks", 0)
                        try:
                            marks = max(0, min(10, int(marks)))
                        except (ValueError, TypeError):
                            marks = 0
                        suggestion = item.get("suggestion", "No feedback available.")
                        out.append({"marks": marks, "suggestion": str(suggestion)})
                    else:
                        out.append({"marks": 0, "suggestion": "No feedback available."})
                return out
        except (json.JSONDecodeError, TypeError):
            pass
    return [{"marks": 0, "suggestion": "No feedback available."} for _ in range(expected_len)]

def judge_quiz(items: list[dict]) -> tuple[list[dict], str | None]:
    """
    Judge each quiz item via Gemini.
    Returns (list of { marks, suggestion }, level_context or None).
    """
    if not items:
        return [], None

    client = get_client()
    user_prompt = build_quiz_judge_user_prompt(items)

    print(f"[Gemini Judge] Sending {len(items)} items to Gemini...")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=QUIZ_JUDGE_SYSTEM,
            temperature=0.1,
            max_output_tokens=2048,
            response_mime_type="application/json",
        ),
    )

    raw = (response.text or "").strip()
    print(f"[Gemini Judge] Raw response ({len(raw)} chars): {raw[:300]}...")
    parsed = _parse_judge_json(raw, len(items))

    level_context = None
    try:
        level_prompt = (
            "Based on the student answers and marks below, state in one short sentence "
            "where the learner is lacking (e.g. 'Struggles with Apply-level procedures')."
        )
        level_resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"Questions graded:\n{user_prompt}\n\nGrades: {json.dumps(parsed)}\n\n{level_prompt}",
            config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=150),
        )
        level_context = (level_resp.text or "").strip()[:200] or None
    except Exception as e:
        print(f"[Gemini Judge] Level-context call failed (non-critical): {e}")

    return parsed, level_context

def builder_fix_judge_format(raw_judge_output: str, expected_len: int) -> list[dict]:
    """Use Gemini to fix malformed judge output into valid JSON array."""
    client = get_client()
    user_msg = f"Input (fix if needed; output must have exactly {expected_len} elements):\n{raw_judge_output[:8000]}"
    print(f"[Gemini Builder] Fixing malformed judge output...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_msg,
        config=types.GenerateContentConfig(
            system_instruction=BUILDER_VALIDATOR_SYSTEM,
            temperature=0.1,
            max_output_tokens=2048,
            response_mime_type="application/json",
        ),
    )
    raw = (response.text or "").strip()
    return _parse_judge_json(raw, expected_len)

def personalize_content(
    topic_name: str,
    base_content: str,
    quiz_qas: list[dict],
    user_level: str,
    previous_quiz_feedback: str | None = None,
    last_topic_recap: str | None = None,
) -> str:
    """
    Call Gemini to personalize base content for the user's level and context.
    Returns personalized Markdown content.
    """
    client = get_client()
    system = build_personalization_system_prompt(user_level)
    user_prompt = build_personalization_user_prompt(
        topic_name=topic_name,
        base_content=base_content,
        quiz_qas=quiz_qas,
        user_level=user_level,
        previous_quiz_feedback=previous_quiz_feedback,
        last_topic_recap=last_topic_recap,
    )
    print(f"[Gemini Personalize] Topic='{topic_name}', Level='{user_level}', BaseLen={len(base_content)}, QAs={len(quiz_qas)}")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system,
            temperature=0.4,
            max_output_tokens=8192,
        ),
    )
    result = (response.text or "").strip()
    print(f"[Gemini Personalize] Got {len(result)} chars back")
    return result