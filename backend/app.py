import os
import json
import random
import traceback
from pathlib import Path
from typing import Tuple, Any
from datetime import datetime, UTC
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo import ASCENDING
from dotenv import load_dotenv
import bcrypt
import re

_BACKEND_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _BACKEND_DIR.parent
load_dotenv(_BACKEND_DIR / ".env")
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    print("[WARNING] GEMINI_API_KEY is not set – personalization and quiz judge will be unavailable.")
GEMINI_AVAILABLE = bool(gemini_api_key)

def _mark_gemini_unavailable(err: Exception) -> None:
  text = str(err or "").lower()
  if "permission_denied" in text or "api key was reported as leaked" in text or "403" in text:
    # Keep Gemini enabled for subsequent requests; fallback is per-request.
    # This avoids sticky "disabled" mode and always gives Gemini another chance.
    print("[Gemini] Permission/auth error encountered; using per-request fallback.")

app = Flask(__name__)

# Allow Next.js dev server by default; override with CORS_ORIGIN env for deploy
cors_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")
CORS(app, resources={r"/api/*": {"origins": cors_origin}}, supports_credentials=False)

# MongoDB (configured in code per deployment — not read from environment)
MONGO_URI = "mongodb+srv://abdullahmalhi361_db_user:EtKklr72IwZMLkNC@teachus1.pw2lfiw.mongodb.net/?appName=Teachus1"
MONGO_DB = "Teachus1"

mongo_client = MongoClient(MONGO_URI)
db = mongo_client[MONGO_DB]
users: Collection = db["users"]
quiz_submissions: Collection = db["quiz_submissions"]
personalized_content: Collection = db["personalized_content"]
user_subtopics: Collection = db["user_subtopics"]

# Single source of truth for per-user subtopic learning artifacts
user_subtopics.create_index(
  [("userId", ASCENDING), ("course", ASCENDING), ("subtopic", ASCENDING)],
  unique=True,
  name="uniq_user_course_subtopic",
)
user_subtopics.create_index([("userId", ASCENDING), ("course", ASCENDING)], name="idx_user_course")
user_subtopics.create_index([("userId", ASCENDING), ("studied", ASCENDING)], name="idx_user_studied")

sparky_sessions: Collection = db["sparky_sessions"]
sparky_sessions.create_index(
  [("userId", ASCENDING), ("dateKey", ASCENDING)],
  unique=True,
  name="uniq_sparky_user_day",
)

LEVEL_QUIZ_MIX_ASSESS = {
  "easy": {"Easy": 4, "Intermediate": 1},
  "intermediate": {"Easy": 1, "Intermediate": 3, "Hard": 1},
  "advanced": {"Easy": 1, "Intermediate": 1, "Hard": 3},
}


def normalize_email(email: str) -> str:
  return email.strip().lower()

def _subtopic_query(user_id: str, email: str, course: str, subtopic: str) -> dict:
  query = {"course": course, "subtopic": subtopic}
  if user_id:
    query["userId"] = user_id
  elif email:
    query["userId"] = email  # fallback for older accounts without userId
  return query

def hash_password(password: str) -> bytes:
  return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

def verify_password(password: str, hashed: bytes) -> bool:
  try:
    return bcrypt.checkpw(password.encode("utf-8"), hashed)
  except ValueError:
    return False

def validate_register_payload(body: dict) -> Tuple[bool, str]:
  first_name = body.get("firstName", "").strip()
  last_name = body.get("lastName", "").strip()
  city = body.get("city", "").strip()
  phone = body.get("phone", "").strip()
  email = body.get("email", "").strip()
  cnic = body.get("cnic", "").strip()
  password = body.get("password", "")
  if not first_name or not last_name or not city or not phone or not email or not password or not cnic:
    return False, "First name, last name, city, phone, CNIC, email, and password are required."
  if len(password) < 6:
    return False, "Password must be at least 6 characters long."
  if len(cnic) != 13 or not cnic.isdigit():
    return False, "CNIC must be exactly 13 digits (numbers only)."
  return True, ""


_DATE_KEY_OK = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _sanitize_date_key(s: str) -> str | None:
  s = (s or "").strip()
  if _DATE_KEY_OK.fullmatch(s):
    return s
  return None


def _flatten_qa_map(qa_map: dict[str, Any]) -> list[dict[str, Any]]:
  out: list[dict[str, Any]] = []
  for _, sources in (qa_map or {}).items():
    if not isinstance(sources, list):
      continue
    for src in sources:
      if not isinstance(src, dict):
        continue
      url = (src.get("url") or "").strip()
      pairs = src.get("qa_pairs") or []
      if not isinstance(pairs, list):
        continue
      for qa in pairs:
        if not isinstance(qa, dict):
          continue
        qtxt = (qa.get("Question") or qa.get("question") or "").strip()
        ans = (qa.get("Answer") or qa.get("answer") or "").strip()
        if not qtxt:
          continue
        out.append(
          {
            "question": qtxt,
            "modelAnswer": ans,
            "answer": ans,
            "difficulty": (qa.get("Difficulty") or qa.get("difficulty") or "Easy"),
            "knowledgeDimension": (qa.get("KnowledgeDimension") or qa.get("knowledgeDimension") or "Factual"),
            "sourceUrl": url or "",
          }
        )
  return out


def _course_qa_paths(course: str) -> list[Path]:
  root = _PROJECT_ROOT
  if course == "Course 1":
    return [root / "content1" / "Course1QAs.json"]
  if course == "Course 2":
    return [root / "content2" / "Course2QAs.json"]
  if course == "Course 3":
    return [
      root / "content3" / "Course3-1" / "Course3-1QAs.json",
      root / "content3" / "Course3-2" / "Course3-2QAs.json",
    ]
  return []


def _load_all_assessment_pairs(course: str) -> list[dict[str, Any]]:
  merged: list[dict[str, Any]] = []
  for pth in _course_qa_paths(course):
    try:
      if not pth.is_file():
        continue
      with open(pth, encoding="utf-8") as f:
        qa_map = json.load(f)
      merged.extend(_flatten_qa_map(qa_map))
    except (OSError, json.JSONDecodeError) as exc:
      print(f"[Assessment] Skip QA file {pth}: {exc}")
  return merged


def _shuffle_assessment_by_level(all_pairs: list[dict[str, Any]], level_key: str) -> list[dict[str, Any]]:
  mix = LEVEL_QUIZ_MIX_ASSESS.get(level_key) or LEVEL_QUIZ_MIX_ASSESS["easy"]
  selected: list[dict[str, Any]] = []
  remaining = list(all_pairs)
  random.shuffle(remaining)

  def pop_first_match(difficulty: str) -> dict[str, Any] | None:
    for i, x in enumerate(remaining):
      if (x.get("difficulty") or "") == difficulty:
        return remaining.pop(i)
    return None

  for difficulty, count in mix.items():
    for _ in range(count):
      if len(selected) >= 5:
        break
      got = pop_first_match(difficulty)
      if got:
        selected.append(got)

  while len(selected) < 5 and remaining:
    selected.append(remaining.pop(0))

  random.shuffle(selected)
  return selected[:5]


@app.route("/api/health", methods=["GET"])
def health():
  return jsonify({"status": "ok"}), 200

@app.route("/api/register", methods=["POST"])
def register():
  body = request.get_json(silent=True) or {}
  valid, error = validate_register_payload(body)
  if not valid:
    return jsonify({"error": error}), 400

  first_name = body["firstName"].strip()
  last_name = body["lastName"].strip()
  city = body["city"].strip()
  phone = body["phone"].strip()
  cnic = body["cnic"].strip()
  email = normalize_email(body["email"])
  password = body["password"]
  user_id = str(random.randint(10_000_000, 99_999_999))

  existing = users.find_one({"email": email})
  if existing:
    return jsonify({"error": "An account with this email already exists."}), 409

  password_hash = hash_password(password)
  users.insert_one(
    {
      "name": f"{first_name} {last_name}".strip(),
      "firstName": first_name,
      "lastName": last_name,
      "city": city,
      "region": city,  # region/city in Pakistan
      "cnic": cnic,
      "phone": phone,
      "course": None,
      "courseEnrolled": None,
      "level": "easy",
      "personalizationScore": 40,
      "lastSubTopicStudied": None,
      "currentTopic": None,
      "userId": user_id,
      "email": email,
      "passwordHash": password_hash,
      "createdAt": datetime.utcnow(),
    }
  )

  return jsonify({"message": "Account created successfully."}), 201

@app.route("/api/login", methods=["POST"])
def login():
  body = request.get_json(silent=True) or {}
  email = normalize_email(body.get("email", ""))
  password = body.get("password", "")
  preferred_language = (body.get("preferredLanguage") or "").strip().lower()

  if not email or not password:
    return jsonify({"error": "Email and password are required."}), 400

  user = users.find_one({"email": email})
  if not user:
    return jsonify({"error": "Invalid email or password."}), 401

  if not verify_password(password, user["passwordHash"]):
    return jsonify({"error": "Invalid email or password."}), 401

  if preferred_language in {"english", "urdu"}:
    users.update_one({"_id": user["_id"]}, {"$set": {"preferredLanguage": preferred_language}})
    user["preferredLanguage"] = preferred_language

  course_val = user.get("course") or user.get("courseEnrolled")
  return (
    jsonify(
      {
        "message": "Login successful.",
        "user": {
          "userId": user.get("userId", ""),
          "firstName": user.get("firstName", ""),
          "lastName": user.get("lastName", ""),
          "email": user["email"],
          "city": user.get("city", ""),
          "region": user.get("region") or user.get("city", ""),
          "phone": user.get("phone", ""),
          "cnic": user.get("cnic", ""),
          "course": course_val,
          "courseEnrolled": course_val,
          "level": user.get("level", "easy"),
          "personalizationScore": user.get("personalizationScore", 40),
          "preferredLanguage": user.get("preferredLanguage", "english"),
          "lastSubTopicStudied": user.get("lastSubTopicStudied"),
          "currentTopic": user.get("currentTopic"),
          "createdAt": user.get("createdAt").isoformat() if user.get("createdAt") else None,
        },
      }
    ),
    200,
  )

VALID_COURSES = {"Course 1", "Course 2", "Course 3"}

@app.route("/api/enroll", methods=["POST"])
def enroll():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  course = body.get("course", "").strip()

  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Invalid course. Must be Course 1, Course 2, or Course 3."}), 400
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400

  query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(query)
  if not user:
    return jsonify({"error": "User not found."}), 404

  current_course = user.get("course") or user.get("courseEnrolled")
  if current_course and current_course != course:
    # User is switching courses - reset progress (caller must have confirmed via popup)
    users.update_one(
      query,
      {
        "$set": {
          "course": course,
          "courseEnrolled": course,
          "lastSubTopicStudied": None,
          "currentTopic": None,
        }
      },
    )
  else:
    # New enrollment
    users.update_one(
      query,
      {
        "$set": {
          "course": course,
          "courseEnrolled": course,
          "lastSubTopicStudied": None,
          "currentTopic": None,
        }
      },
    )

  updated = users.find_one(query)
  course_val = updated.get("course") or updated.get("courseEnrolled")
  return jsonify({
    "message": "Enrollment successful.",
    "user": {
      "userId": updated.get("userId", ""),
      "course": course_val,
      "courseEnrolled": course_val,
      "lastSubTopicStudied": None,
      "currentTopic": None,
    },
  }), 200

@app.route("/api/user/progress", methods=["POST"])
def update_progress():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  last_sub_topic = body.get("lastSubTopicStudied")
  current_topic = body.get("currentTopic")

  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400

  query = {"userId": user_id} if user_id else {"email": email}
  update = {}
  if last_sub_topic is not None:
    update["lastSubTopicStudied"] = last_sub_topic
  if current_topic is not None:
    update["currentTopic"] = current_topic
  if not update:
    return jsonify({"error": "lastSubTopicStudied or currentTopic required."}), 400

  result = users.update_one(query, {"$set": update})
  if result.matched_count == 0:
    return jsonify({"error": "User not found."}), 404
  return jsonify({"message": "Progress updated."}), 200

@app.route("/api/user/language", methods=["POST"])
def set_language():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  preferred_language = (body.get("preferredLanguage") or "").strip().lower()
  if preferred_language not in {"english", "urdu"}:
    return jsonify({"error": "preferredLanguage must be 'english' or 'urdu'."}), 400
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  query = {"userId": user_id} if user_id else {"email": email}
  result = users.update_one(query, {"$set": {"preferredLanguage": preferred_language}})
  if result.matched_count == 0:
    return jsonify({"error": "User not found."}), 404
  return jsonify({"preferredLanguage": preferred_language}), 200

@app.route("/api/user/subtopic/status", methods=["POST"])
def upsert_subtopic_status():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  course = body.get("course", "").strip()
  topic = body.get("topic", "").strip()
  subtopic_name = body.get("subtopicName", "").strip()
  studied = bool(body.get("studied", True))
  content = body.get("content")
  quiz = body.get("quiz")
  force_content_overwrite = bool(body.get("forceContentOverwrite", False))
  force_quiz_overwrite = bool(body.get("forceQuizOverwrite", False))

  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Valid course is required."}), 400
  if not subtopic_name:
    return jsonify({"error": "subtopicName is required."}), 400
  if content is not None and not isinstance(content, str):
    return jsonify({"error": "content must be a string when provided."}), 400
  if quiz is not None and not isinstance(quiz, dict):
    return jsonify({"error": "quiz must be an object when provided."}), 400

  user_query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(user_query)
  if not user:
    return jsonify({"error": "User not found."}), 404

  resolved_user_id = user.get("userId") or user.get("email")
  if not resolved_user_id:
    return jsonify({"error": "User identifier missing."}), 500

  now = datetime.now(UTC)
  doc_query = {"userId": resolved_user_id, "course": course, "subtopic": subtopic_name}
  existing = user_subtopics.find_one(doc_query)

  existing_content = (existing or {}).get("content") or ""
  has_existing_content = isinstance(existing_content, str) and bool(existing_content.strip())
  has_existing_quiz = isinstance((existing or {}).get("quiz"), dict) and bool((existing or {}).get("quiz"))

  set_fields = {
    "studied": studied,
    "lastViewedAt": now,
    "topic": topic,
  }

  # Content update policy:
  # - do not overwrite existing content unless forceContentOverwrite=true
  # - set contentGenerated in $set only (never in $setOnInsert) to avoid conflicts
  if isinstance(content, str) and content.strip():
    if (not has_existing_content) or force_content_overwrite:
      set_fields["content"] = content
      set_fields["contentGenerated"] = True
    else:
      set_fields["contentGenerated"] = True
  else:
    set_fields["contentGenerated"] = has_existing_content

  # Quiz update policy:
  # - do not overwrite an already-attempted quiz unless forceQuizOverwrite=true
  if isinstance(quiz, dict) and quiz:
    if (not has_existing_quiz) or force_quiz_overwrite:
      set_fields["quiz"] = quiz

  set_on_insert_fields = {
    "createdAt": now,
    "userId": resolved_user_id,
    "course": course,
    "subtopic": subtopic_name,
  }

  result = user_subtopics.update_one(
    doc_query,
    {
      "$set": set_fields,
      "$setOnInsert": set_on_insert_fields,
    },
    upsert=True,
  )

  users.update_one(
    user_query,
    {"$set": {"currentTopic": subtopic_name, **({"lastSubTopicStudied": subtopic_name} if studied else {})}},
  )

  response = {
    "message": "Subtopic status upserted successfully.",
    "matchedCount": result.matched_count,
    "modifiedCount": result.modified_count,
    "upsertedId": str(result.upserted_id) if result.upserted_id else None,
    "contentUpdated": "content" in set_fields,
    "quizUpdated": "quiz" in set_fields,
    "contentGenerated": bool(set_fields.get("contentGenerated", False)),
  }
  return jsonify(response), 200

@app.route("/api/user/course-progress", methods=["POST"])
def get_course_progress():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  course = body.get("course", "").strip()
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Valid course is required."}), 400
  query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(query)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved_user_id = user.get("userId") or user.get("email")
  docs = list(user_subtopics.find({"userId": resolved_user_id, "course": course}))
  studied_subtopics = [d.get("subtopic") for d in docs if d.get("studied")]
  subtopics = {
    d.get("subtopic"): {
      "studied": bool(d.get("studied")),
      "lastViewedAt": d.get("lastViewedAt"),
      "hasContent": bool(d.get("contentGenerated")),
      "hasQuiz": bool(d.get("quiz")),
    }
    for d in docs
  }
  return jsonify({"studiedSubtopics": studied_subtopics, "subtopics": subtopics}), 200

@app.route("/api/user/course-progress/init", methods=["POST"])
def init_course_progress():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  course = body.get("course", "").strip()
  subtopics = body.get("subtopics", [])
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Valid course is required."}), 400
  if not isinstance(subtopics, list):
    return jsonify({"error": "subtopics array is required."}), 400

  query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(query)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved_user_id = user.get("userId") or user.get("email")
  now = datetime.utcnow()
  for name in subtopics:
    if not isinstance(name, str) or not name.strip():
      continue
    user_subtopics.update_one(
      {"userId": resolved_user_id, "course": course, "subtopic": name.strip()},
      {
        "$setOnInsert": {
          "topic": "",
          "studied": False,
          "contentGenerated": False,
          "content": "",
          "quiz": {},
          "createdAt": now,
          "lastViewedAt": now,
        }
      },
      upsert=True,
    )
  return jsonify({"message": "Course progress initialized."}), 200

@app.route("/api/user/dashboard-summary", methods=["POST"])
def dashboard_summary():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(query)
  if not user:
    return jsonify({"error": "User not found."}), 404
  course = user.get("course") or user.get("courseEnrolled")
  resolved_user_id = user.get("userId") or user.get("email")
  docs = list(user_subtopics.find({"userId": resolved_user_id, "course": course}))
  studied = [
    {"title": d.get("subtopic"), "lastViewedAt": d.get("lastViewedAt")}
    for d in docs
    if d.get("studied")
  ]
  quizzes_attempted = sum(1 for d in docs if isinstance(d.get("quiz"), dict) and d.get("quiz"))
  quiz_scores = [
    float((d.get("quiz") or {}).get("score"))
    for d in docs
    if isinstance(d.get("quiz"), dict) and isinstance((d.get("quiz") or {}).get("score"), (int, float))
  ]
  average_score = round(sum(quiz_scores) / len(quiz_scores), 2) if quiz_scores else 0.0
  recent_scores = quiz_scores[-5:]
  return jsonify({
    "quizzesAttempted": quizzes_attempted,
    "studiedSubtopics": studied,
    "averageQuizScore": average_score,
    "recentQuizScores": recent_scores,
    "personalizationScore": float(user.get("personalizationScore", 40)),
    "level": _normalize_level(user.get("level")),
  }), 200

def _fallback_quiz_judge(items: list[dict]) -> list[dict]:
  """
  Local, non-LLM fallback grading when Gemini quota is exhausted.
  Very simple heuristic:
  - Empty or extremely short answer -> 0 marks.
  - High word overlap with model answer -> 8–10.
  - Some overlap -> 4–7.
  - Otherwise -> 1–3.
  Suggestions are generic, teacher-like messages.
  """
  results: list[dict] = []

  for it in items:
    model = (it.get("modelAnswer") or "").lower().strip()
    user = (it.get("userAnswer") or "").lower().strip()

    if not user:
      marks = 0
      suggestion = "You did not provide an answer. Try to write at least a few lines in your own words."
      results.append({"marks": marks, "suggestion": suggestion})
      continue

    if len(user) < 10:
      marks = 1
      suggestion = "Your answer is too short. Explain in full sentences what should be done and why."
      results.append({"marks": marks, "suggestion": suggestion})
      continue

    # Token-based overlap
    def tokens(text: str) -> set[str]:
      return {t for t in re.split(r"[^a-z0-9]+", text) if len(t) > 3}

    model_tokens = tokens(model)
    user_tokens = tokens(user)
    common = model_tokens.intersection(user_tokens)
    overlap = len(common) / max(len(model_tokens) or 1, 1)

    if overlap >= 0.6:
      marks = 9
      suggestion = "Good answer. You covered the main safety points and explained them clearly. You can add one or two workshop examples to make it even stronger."
    elif overlap >= 0.3:
      marks = 6
      suggestion = "You mentioned some correct ideas, but you missed a few key details. Re-read the model answer and focus on the exact steps and safety checks."
    else:
      marks = 3
      suggestion = "Your answer is not closely matching the expected explanation. Review the topic again, especially the sequence of steps and the important safety rules."

    results.append({"marks": marks, "suggestion": suggestion})

  return results

def _run_quiz_judge(questions: list, user_answers: list) -> tuple[list, str | None]:
  """Call Gemini to judge each QA; return (results, level_context)."""
  if not questions or len(user_answers) != len(questions):
    print("[Judge] Skipped: question/answer count mismatch or empty.")
    return [], None

  items = []
  for i, q in enumerate(questions):
    items.append({
      "question": q.get("question") or q.get("Question", ""),
      "modelAnswer": q.get("answer") or q.get("Answer", ""),
      "userAnswer": user_answers[i] if i < len(user_answers) else "",
      "difficulty": q.get("difficulty") or q.get("Difficulty", "Easy"),
      "knowledgeDimension": q.get("knowledgeDimension") or q.get("KnowledgeDimension", "Factual"),
    })

  if not GEMINI_AVAILABLE:
    print("[Judge] Gemini unavailable (missing key), using local fallback judge.")
    return _fallback_quiz_judge(items), None

  try:
    from gemini_service import judge_quiz, builder_fix_judge_format
    with ThreadPoolExecutor(max_workers=1) as executor:
      future = executor.submit(judge_quiz, items)
      try:
        results, level_context = future.result(timeout=90)
      except FuturesTimeoutError:
        print("[Judge] Gemini timed out after 60s; using local fallback judge.")
        return _fallback_quiz_judge(items), None
    if len(results) != len(items) or not all(isinstance(r.get("marks"), (int, float)) for r in results):
      print(f"[Judge] Malformed output ({len(results)} vs {len(items)}), running builder fix...")
      results = builder_fix_judge_format(str(results), len(items))
    print(f"[Judge] Success: {len(results)} results, levelContext={level_context}")
    return results, level_context
  except Exception as e:
    _mark_gemini_unavailable(e)
    print(f"[Judge] ERROR (falling back to local grading): {e}")
    traceback.print_exc()
    fallback = _fallback_quiz_judge(items)
    return fallback, None

def _normalize_level(level: str | None) -> str:
  lv = (level or "").strip().lower()
  if lv == "hard":
    return "advanced"
  if lv in {"easy", "intermediate", "advanced"}:
    return lv
  return "easy"

def _target_level_for_score(personalization_score: float) -> str:
  if personalization_score > 65:
    return "advanced"
  if personalization_score > 40:
    return "intermediate"
  return "easy"

def _score_delta_from_quiz_percent(quiz_percent: float) -> int:
  """
  >50 increases, <50 decreases, 50 stays stable.
  Delta is clamped to prevent one-quiz jumps.
  """
  raw = (quiz_percent - 50.0) / 10.0
  return max(-5, min(5, round(raw)))

def _next_level_with_stability(current_level: str, target_level: str, recent_targets: list[str]) -> tuple[str, list[str], bool]:
  """
  Apply 2-of-last-3 consistency before changing level.
  """
  normalized_targets = [_normalize_level(x) for x in recent_targets if isinstance(x, str)]
  normalized_targets.append(_normalize_level(target_level))
  normalized_targets = normalized_targets[-3:]

  counts = {
    "easy": normalized_targets.count("easy"),
    "intermediate": normalized_targets.count("intermediate"),
    "advanced": normalized_targets.count("advanced"),
  }
  strongest = max(counts, key=counts.get)
  should_change = counts[strongest] >= 2 and strongest != current_level
  return (strongest if should_change else current_level), normalized_targets, should_change

def _local_personalize_content(
  topic_name: str,
  base_content: str,
  user_level: str,
  previous_quiz_feedback: str,
  last_topic_recap: str,
) -> str:
  """
  Deterministic fallback personalization when Gemini is unavailable or blocked.
  Ensures output is visibly adapted (not just raw base content).
  """
  level = _normalize_level(user_level)
  heading = {
    "easy": "Beginner-Friendly Personalized Notes",
    "intermediate": "Intermediate Personalized Notes",
    "advanced": "Advanced Personalized Notes",
  }.get(level, "Personalized Notes")
  focus = {
    "easy": "Focus on core definitions, basic checks, and safe step-by-step practice.",
    "intermediate": "Focus on diagnosis flow, cause-effect analysis, and practical interpretation.",
    "advanced": "Focus on deeper analysis, optimization choices, and professional troubleshooting judgment.",
  }.get(level, "")

  weak_area = (previous_quiz_feedback or "").strip()
  recap = (last_topic_recap or "").strip()
  recap_line = f"- Previous topic recap: {recap}" if recap else "- Previous topic recap: Not available."
  weak_line = f"- Weak areas to reinforce: {weak_area}" if weak_area else "- Weak areas to reinforce: General revision and applied understanding."

  return (
    f"## {heading}\n\n"
    f"### Topic: {topic_name}\n\n"
    f"### Personalization Focus\n"
    f"{focus}\n\n"
    f"### Learning Context\n"
    f"{recap_line}\n"
    f"{weak_line}\n\n"
    f"### Personalized Lesson\n"
    f"{(base_content or '').strip()}\n\n"
    f"### Practice Guidance\n"
    f"- Review this topic once quickly, then explain it in your own words.\n"
    f"- Solve one practical scenario and note where you were uncertain.\n"
    f"- Revisit the weak area notes after practice for retention.\n"
  ).strip()

def _append_reference_resource_section(content: str, resources: list[dict]) -> str:
  """
  Append a compact reference/resource box at the end of generated content.
  The resources are selected via embedding similarity (cosine-style semantic retrieval).
  """
  base = (content or "").rstrip()
  marker = "### Personalized Recommendation Resources"
  if marker in base:
    return base
  lines = [
    "### Personalized Recommendation Resources",
    "These resources are recommended based on your current lesson and learning gaps using cosine-similarity semantic matching.",
  ]
  for i, item in enumerate(resources, start=1):
    url = (item or {}).get("url", "").strip()
    topic = (item or {}).get("topic", "").strip()
    if not url:
      continue
    label = topic if topic else f"Recommended Resource {i}"
    lines.append(f"- [{label}]({url}) - A focused reference to strengthen this subtopic.")

  # Fall back gracefully when no URLs are available.
  if len(lines) <= 2:
    lines.append("- [Review this lesson again](#) - No external references were available, so revise the personalized notes above.")
  return f"{base}\n\n" + "\n".join(lines)

def _resources_from_rag_chunks(rag_chunks: list[dict], top_k: int = 5) -> list[dict]:
  out: list[dict] = []
  seen = set()
  for c in rag_chunks or []:
    url = str((c or {}).get("url", "")).strip()
    topic = str((c or {}).get("topic", "")).strip()
    if not url or url in seen:
      continue
    seen.add(url)
    out.append({"url": url, "topic": topic})
    if len(out) >= top_k:
      break
  return out

def _resources_from_text_urls(text: str, top_k: int = 5) -> list[dict]:
  out: list[dict] = []
  seen = set()
  for m in re.findall(r"https?://[^\s\)\]]+", text or ""):
    url = m.strip().rstrip(".,;")
    if not url or url in seen:
      continue
    seen.add(url)
    out.append({"url": url, "topic": "Recommended resource"})
    if len(out) >= top_k:
      break
  return out

def _merge_resources(*sources: list[dict], top_k: int = 5) -> list[dict]:
  merged: list[dict] = []
  seen = set()
  for src in sources:
    for item in src or []:
      url = str((item or {}).get("url", "")).strip()
      topic = str((item or {}).get("topic", "")).strip()
      if not url or url in seen:
        continue
      seen.add(url)
      merged.append({"url": url, "topic": topic})
      if len(merged) >= top_k:
        return merged
  return merged

@app.route("/api/quiz/judge", methods=["POST"])
def quiz_judge():
  """Standalone judge endpoint: body { items: [{ question, modelAnswer, userAnswer, difficulty, knowledgeDimension }] }."""
  body = request.get_json(silent=True) or {}
  items = body.get("items", [])
  if not items:
    return jsonify({"error": "items array required."}), 400
  if not GEMINI_AVAILABLE:
    normalized_items = []
    for item in items:
      normalized_items.append({
        "question": item.get("question") or "",
        "modelAnswer": item.get("modelAnswer") or "",
        "userAnswer": item.get("userAnswer") or "",
        "difficulty": item.get("difficulty") or "Easy",
        "knowledgeDimension": item.get("knowledgeDimension") or "Factual",
      })
    return jsonify({
      "results": _fallback_quiz_judge(normalized_items),
      "levelContext": None,
      "judgeFallback": True,
      "message": "Gemini unavailable (missing key); used local judge fallback."
    }), 200

  try:
    from gemini_service import judge_quiz, builder_fix_judge_format
    with ThreadPoolExecutor(max_workers=1) as executor:
      future = executor.submit(judge_quiz, items)
      try:
        results, level_context = future.result(timeout=60)
      except FuturesTimeoutError:
        normalized_items = []
        for item in items:
          normalized_items.append({
            "question": item.get("question") or "",
            "modelAnswer": item.get("modelAnswer") or "",
            "userAnswer": item.get("userAnswer") or "",
            "difficulty": item.get("difficulty") or "Easy",
            "knowledgeDimension": item.get("knowledgeDimension") or "Factual",
          })
        return jsonify({
          "results": _fallback_quiz_judge(normalized_items),
          "levelContext": None,
          "judgeFallback": True,
          "message": "Gemini timed out after 60 seconds; used local judge fallback."
        }), 200
    if len(results) != len(items):
      results = builder_fix_judge_format(str(results), len(items))
    return jsonify({"results": results, "levelContext": level_context}), 200
  except Exception as e:
    _mark_gemini_unavailable(e)
    # Graceful fallback for Gemini outages / leaked key / rate limits.
    print(f"[Judge Endpoint] ERROR (using local fallback): {e}")
    traceback.print_exc()
    normalized_items = []
    for item in items:
      normalized_items.append({
        "question": item.get("question") or "",
        "modelAnswer": item.get("modelAnswer") or "",
        "userAnswer": item.get("userAnswer") or "",
        "difficulty": item.get("difficulty") or "Easy",
        "knowledgeDimension": item.get("knowledgeDimension") or "Factual",
      })
    fallback_results = _fallback_quiz_judge(normalized_items)
    return jsonify({
      "results": fallback_results,
      "levelContext": None,
      "judgeFallback": True,
      "message": "Gemini unavailable; used local judge fallback."
    }), 200

@app.route("/api/quiz/submit", methods=["POST"])
def quiz_submit():
  body = request.get_json(silent=True) or {}
  email = normalize_email(body.get("email", ""))
  user_id = body.get("userId", "").strip()
  subtopic_name = body.get("subtopicName", "").strip()
  course = body.get("course", "").strip()
  questions = body.get("questions", [])
  user_answers = body.get("userAnswers", [])

  if not email and not user_id:
    return jsonify({"error": "email or userId is required."}), 400
  if not subtopic_name:
    return jsonify({"error": "subtopicName is required."}), 400
  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Valid course is required."}), 400
  if not questions or not user_answers:
    return jsonify({"error": "questions and userAnswers are required."}), 400

  query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(query)
  if not user:
    return jsonify({"error": "User not found."}), 404

  judge_results, level_context = _run_quiz_judge(questions, user_answers)
  score = round(sum(int(r.get("marks", 0)) for r in judge_results) / max(len(judge_results), 1), 2)
  quiz_percent = round(score * 10.0, 2)

  current_personalization = float(user.get("personalizationScore", 40))
  delta = _score_delta_from_quiz_percent(quiz_percent)
  updated_personalization = max(20.0, min(100.0, round(current_personalization + delta, 2)))

  current_level = _normalize_level(user.get("level"))
  target_level = _target_level_for_score(updated_personalization)
  recent_level_targets = user.get("recentLevelTargets") if isinstance(user.get("recentLevelTargets"), list) else []
  next_level, rolled_targets, level_changed = _next_level_with_stability(
    current_level=current_level,
    target_level=target_level,
    recent_targets=recent_level_targets,
  )
  # Single source of truth: persist quiz in user_subtopics
  resolved_user_id = user.get("userId") or user.get("email")
  quiz_payload = {
    "questions": questions,
    "userAnswers": user_answers,
    "judgeResults": judge_results,
    "score": score,
    "submittedAt": datetime.utcnow(),
  }
  user_subtopics.update_one(
    {"userId": resolved_user_id, "course": course, "subtopic": subtopic_name},
    {
      "$set": {
        "topic": body.get("topic", "").strip(),
        "studied": True,
        "lastViewedAt": datetime.utcnow(),
        "quiz": quiz_payload,
      },
      "$setOnInsert": {
        "createdAt": datetime.utcnow(),
        "contentGenerated": False,
        "content": "",
      },
    },
    upsert=True,
  )

  # Keep user profile lightweight metadata only
  summary_for_next = level_context or (
    "Quiz completed for " + subtopic_name + "."
    + (" Weak areas: " + level_context if level_context else "")
  )
  recap_one_line = subtopic_name + ": " + (level_context or "completed.")
  users.update_one(
    query,
    {
      "$set": {
        "lastTopicJudgeSummary": summary_for_next[:500],
        "lastTopicRecap": recap_one_line[:300],
        "lastSubTopicStudied": subtopic_name,
        "currentTopic": subtopic_name,
        "personalizationScore": updated_personalization,
        "level": next_level,
        "recentLevelTargets": rolled_targets,
      },
    },
  )

  return jsonify({
    "message": "Quiz submitted successfully.",
    "judgeResults": judge_results,
    "score": score,
    "quizPercent": quiz_percent,
    "scoreDelta": delta,
    "personalizationScore": updated_personalization,
    "level": next_level,
    "levelChanged": level_changed,
  }), 201

@app.route("/api/quiz/status", methods=["POST"])
def quiz_status():
  body = request.get_json(silent=True) or {}
  email = normalize_email(body.get("email", ""))
  user_id = body.get("userId", "").strip()
  subtopic_name = body.get("subtopicName", "").strip()
  course = body.get("course", "").strip()

  if not email and not user_id:
    return jsonify({"error": "email or userId is required."}), 400
  if not subtopic_name:
    return jsonify({"error": "subtopicName is required."}), 400
  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Valid course is required."}), 400

  user_query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(user_query)
  if not user:
    return jsonify({"attempted": False}), 200
  resolved_user_id = user.get("userId") or user.get("email")
  record = user_subtopics.find_one({"userId": resolved_user_id, "course": course, "subtopic": subtopic_name})
  if not record or not isinstance(record.get("quiz"), dict) or not record.get("quiz"):
    return jsonify({"attempted": False}), 200

  quiz = record.get("quiz") or {}
  sub = {
    "questions": quiz.get("questions", []),
    "userAnswers": quiz.get("userAnswers", []),
    "judgeResults": quiz.get("judgeResults", []),
    "score": quiz.get("score"),
    "submittedAt": quiz.get("submittedAt").isoformat() if quiz.get("submittedAt") else None,
  }
  return jsonify({"attempted": True, "submission": sub}), 200

@app.route("/api/personalize/content", methods=["POST"])
def personalize_content():
  """Personalize content for user level and context. Body: userId?, email?, subtopicName, course, userLevel, baseContent, quizQAs, previousQuizFeedback?, lastTopicRecap?.
  Caches result in MongoDB per user + course + subtopic so we don't regenerate on every visit."""
  body = request.get_json(silent=True) or {}
  subtopic_name = (body.get("subtopicName") or "").strip()
  course = (body.get("course") or "").strip()
  user_level = (body.get("userLevel") or "easy").strip().lower()
  base_content = body.get("baseContent") or ""
  quiz_qas = body.get("quizQAs") or []
  previous_quiz_feedback = body.get("previousQuizFeedback") or ""
  last_topic_recap = body.get("lastTopicRecap") or ""

  if not subtopic_name:
    return jsonify({"error": "subtopicName is required."}), 400

  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))

  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  user_query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(user_query)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved_user_id = user.get("userId") or user.get("email")
  # Source of truth lookup
  existing = user_subtopics.find_one({"userId": resolved_user_id, "course": course, "subtopic": subtopic_name})
  if existing and existing.get("contentGenerated") and existing.get("content"):
    print(f"[Personalize] HIT user_subtopics for {course} / {subtopic_name}")
    quiz = existing.get("quiz") if isinstance(existing.get("quiz"), dict) else {}
    recommended_resources = existing.get("recommendedResources") if isinstance(existing.get("recommendedResources"), list) else []
    enriched_content = _append_reference_resource_section(existing.get("content"), recommended_resources)
    return jsonify({
      "content": enriched_content,
      "quiz": quiz,
      "recommendedResources": recommended_resources,
      "studied": bool(existing.get("studied")),
      "contentGenerated": True,
      "cached": True,
    }), 200

  if not base_content:
    return jsonify({"error": "baseContent is required when content is not already stored."}), 400
  # Optional: load previous feedback and last-topic recap from user profile
  if not previous_quiz_feedback:
    previous_quiz_feedback = user.get("lastTopicJudgeSummary") or ""
  if not last_topic_recap:
    last_topic_recap = user.get("lastTopicRecap") or ""

  # Add previous-topic quiz answers context so personalization can connect
  # new base content with recently attempted concepts.
  try:
    prev_subtopic = (user.get("lastSubTopicStudied") or "").strip()
    if prev_subtopic:
      prev_doc = user_subtopics.find_one({"userId": resolved_user_id, "course": course, "subtopic": prev_subtopic})
      prev_quiz = (prev_doc or {}).get("quiz") if isinstance((prev_doc or {}).get("quiz"), dict) else {}
      prev_questions = prev_quiz.get("questions", []) if isinstance(prev_quiz.get("questions", []), list) else []
      prev_answers = prev_quiz.get("userAnswers", []) if isinstance(prev_quiz.get("userAnswers", []), list) else []
      if prev_questions and prev_answers:
        lines = []
        for i, q in enumerate(prev_questions[:5]):
          q_text = (q or {}).get("question") or (q or {}).get("Question") or ""
          a_text = prev_answers[i] if i < len(prev_answers) else ""
          if not q_text and not a_text:
            continue
          lines.append(f"{i+1}. Q: {q_text}\n   Student answer: {a_text}")
        if lines:
          extra = "Previous topic learner answers for personalization context:\n" + "\n".join(lines)
          previous_quiz_feedback = ((previous_quiz_feedback + "\n\n" + extra).strip() if previous_quiz_feedback else extra)
  except Exception as prev_quiz_err:
    print(f"[Personalize] Previous quiz context enrichment skipped: {prev_quiz_err}")

  gemini_personalize = None
  if GEMINI_AVAILABLE:
    from gemini_service import personalize_content as gemini_personalize
  try:
    # RAG: query enhancement + hybrid retrieve + rerank
    enhanced_query = subtopic_name
    rag_chunks = []
    rag_context = ""
    try:
      from rag_pipeline import enhance_query, retrieve_context, recommend_resources_from_content
      enhanced_query = enhance_query(subtopic_name, previous_quiz_feedback, last_topic_recap)
      rag_chunks = retrieve_context(enhanced_query)
      rag_context = "\n\n".join(
        [f"[{i+1}] topic={c.get('topic','')}, url={c.get('url','')}\n{c.get('text','')}" for i, c in enumerate(rag_chunks)]
      )
    except Exception as rag_err:
      print(f"[RAG] Retrieval disabled/fallback due to error: {rag_err}")

    print(f"[Personalize] MISS -> generating for topic='{subtopic_name}', level='{user_level}'")
    augmented_base = base_content
    if rag_context:
      augmented_base = (
        base_content
        + "\n\nUse the following retrieved context to improve explanations, include real-world examples, and address weak areas:\n"
        + rag_context
      )

    # Wait up to 60s for Gemini. If it exceeds this,
    # we fall back to local personalization and still compute recommendations.
    if (not GEMINI_AVAILABLE) or gemini_personalize is None:
      content = ""
      print("[Personalize] Gemini unavailable (missing key), using local personalization fallback.")
    else:
      with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(
          gemini_personalize,
          topic_name=subtopic_name,
          base_content=augmented_base,
          quiz_qas=quiz_qas,
          user_level=user_level,
          previous_quiz_feedback=previous_quiz_feedback or None,
          last_topic_recap=last_topic_recap or None,
        )
        try:
          content = future.result(timeout=60)
        except FuturesTimeoutError:
          content = ""
          print("[Personalize] Gemini timed out after 60s; switching to fallback personalization.")
    if not isinstance(content, str) or not content.strip() or content.strip() == augmented_base.strip():
      content = _local_personalize_content(
        topic_name=subtopic_name,
        base_content=base_content,
        user_level=user_level,
        previous_quiz_feedback=previous_quiz_feedback,
        last_topic_recap=last_topic_recap,
      )
    rag_resources = _resources_from_rag_chunks(rag_chunks, top_k=5)
    recommended_resources = []
    try:
      from rag_pipeline import recommend_resources_from_content
      recommended_resources = recommend_resources_from_content(content, top_k=5)
    except Exception as rec_err:
      print(f"[RAG] Recommendation fallback due to error: {rec_err}")
    recommended_resources = _merge_resources(
      recommended_resources,
      rag_resources,
      _resources_from_text_urls(content, top_k=5),
      _resources_from_text_urls(base_content, top_k=5),
      top_k=5,
    )
    content_with_resources = _append_reference_resource_section(content, recommended_resources)

    print(f"[Personalize] MISS -> generated {len(content_with_resources)} chars, storing in user_subtopics")
    now = datetime.utcnow()
    user_subtopics.update_one(
      {"userId": resolved_user_id, "course": course, "subtopic": subtopic_name},
      {
        "$set": {
          "topic": body.get("topic", "").strip(),
          "studied": bool((existing or {}).get("studied", False)),
          "contentGenerated": True,
          "content": content_with_resources,
          "recommendedResources": recommended_resources,
          "lastViewedAt": now,
        },
        "$setOnInsert": {
          "createdAt": now,
          "quiz": {},
        },
      },
      upsert=True,
    )
    users.update_one(user_query, {"$set": {"currentTopic": subtopic_name}})
    return jsonify({
      "content": content_with_resources,
      "recommendedResources": recommended_resources,
      "cached": False,
      "contentGenerated": True
    }), 200
  except Exception as e:
    _mark_gemini_unavailable(e)
    print(f"[Personalize] ERROR: {e}")
    traceback.print_exc()
    # Graceful fallback: return base content instead of failing request.
    fallback_resources = []
    try:
      from rag_pipeline import recommend_resources_from_content
      fallback_resources = recommend_resources_from_content(base_content, top_k=5)
    except Exception as rec_err:
      print(f"[RAG] Recommendation fallback failed in exception path: {rec_err}")
    fallback_resources = _merge_resources(
      fallback_resources,
      _resources_from_rag_chunks(rag_chunks if isinstance(locals().get("rag_chunks"), list) else [], top_k=5),
      _resources_from_text_urls(base_content, top_k=5),
      top_k=5,
    )

    fallback_core = _local_personalize_content(
      topic_name=subtopic_name,
      base_content=base_content,
      user_level=user_level,
      previous_quiz_feedback=previous_quiz_feedback,
      last_topic_recap=last_topic_recap,
    )
    fallback_content = _append_reference_resource_section(fallback_core, fallback_resources)
    now = datetime.utcnow()
    user_subtopics.update_one(
      {"userId": resolved_user_id, "course": course, "subtopic": subtopic_name},
      {
        "$set": {
          "topic": body.get("topic", "").strip(),
          "studied": bool((existing or {}).get("studied", False)),
          "contentGenerated": True,
          "content": fallback_content,
          "recommendedResources": fallback_resources,
          "lastViewedAt": now,
        },
        "$setOnInsert": {
          "createdAt": now,
          "quiz": {},
        },
      },
      upsert=True,
    )
    return jsonify({
      "content": fallback_content,
      "recommendedResources": fallback_resources,
      "cached": False,
      "contentGenerated": True,
      "personalizationFallback": True,
      "message": "Personalization used fallback content.",
    }), 200


def _find_user_by_ids(user_id: str, email: str):
  if user_id:
    u = users.find_one({"userId": user_id.strip()})
    if u:
      return u
  if email:
    u = users.find_one({"email": normalize_email(email)})
    if u:
      return u
  return None


@app.route("/api/sparky/sessions", methods=["GET"])
def sparky_list_sessions():
  user_id = request.args.get("userId", "").strip()
  email = normalize_email(request.args.get("email", ""))
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  user = _find_user_by_ids(user_id, email)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved = user.get("userId") or user.get("email")
  cursor = (
    sparky_sessions.find({"userId": resolved}, {"dateKey": 1, "messages": 1, "updatedAt": 1})
    .sort("dateKey", -1)
    .limit(60)
  )
  out = []
  for doc in cursor:
    msgs = doc.get("messages") or []
    preview = ""
    for m in reversed(msgs):
      if isinstance(m, dict) and m.get("role") == "user" and m.get("content"):
        preview = str(m.get("content", ""))[:120]
        break
    out.append(
      {
        "dateKey": doc.get("dateKey", ""),
        "preview": preview,
        "messageCount": len(msgs),
        "updatedAt": doc.get("updatedAt").isoformat() if doc.get("updatedAt") else None,
      }
    )
  return jsonify({"sessions": out}), 200


@app.route("/api/sparky/session", methods=["GET"])
def sparky_get_session():
  user_id = request.args.get("userId", "").strip()
  email = normalize_email(request.args.get("email", ""))
  date_key = _sanitize_date_key(request.args.get("dateKey", ""))
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  if not date_key:
    return jsonify({"error": "Valid dateKey (YYYY-MM-DD) is required."}), 400
  user = _find_user_by_ids(user_id, email)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved = user.get("userId") or user.get("email")
  doc = sparky_sessions.find_one({"userId": resolved, "dateKey": date_key})
  msgs = (doc or {}).get("messages") or []
  return jsonify({"dateKey": date_key, "messages": msgs}), 200


@app.route("/api/sparky/chat", methods=["POST"])
def sparky_chat():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  message = (body.get("message") or "").strip()
  date_key = _sanitize_date_key(body.get("dateKey", ""))
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  if not message:
    return jsonify({"error": "message is required."}), 400
  if len(message) > 12000:
    return jsonify({"error": "Message is too long."}), 400
  user = _find_user_by_ids(user_id, email)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved = user.get("userId") or user.get("email")
  if not date_key:
    return jsonify({"error": "Valid dateKey (YYYY-MM-DD) is required."}), 400

  prev_doc = sparky_sessions.find_one({"userId": resolved, "dateKey": date_key})
  prior_msgs: list = list((prev_doc or {}).get("messages") or [])
  if len(prior_msgs) > 40:
    prior_msgs = prior_msgs[-40:]

  history_lines: list[str] = []
  for m in prior_msgs:
    if not isinstance(m, dict):
      continue
    role = (m.get("role") or "").strip().upper()
    content = (m.get("content") or "").strip()
    if content and role in {"USER", "ASSISTANT"}:
      history_lines.append(f"{role}: {content}")
  history_text = "\n".join(history_lines[-24:])

  retrieved_block = ""
  try:
    from rag_pipeline import retrieve_context

    chunks = retrieve_context(message)
    if chunks:
      parts = []
      for i, c in enumerate(chunks, 1):
        if not isinstance(c, dict):
          continue
        parts.append(
          f"[{i}] topic={c.get('topic', '')} url={c.get('url', '')}\n{c.get('text', '')}"
        )
      retrieved_block = "\n\n".join(parts)
  except Exception as rag_err:
    print(f"[Sparky] RAG skipped: {rag_err}")

  reply_body = ""
  used_fallback = False
  if not GEMINI_AVAILABLE:
    reply_body = (
      "⚠️ **Assistant unavailable**\n\nThe AI tutor can't run right now (missing Gemini API configuration). "
      "Please configure `GEMINI_API_KEY` on the server, or continue learning from course materials."
    )
    used_fallback = True
  else:
    try:
      from gemini_service import sparky_reply

      with ThreadPoolExecutor(max_workers=1) as executor:
        fut = executor.submit(sparky_reply, history_text, retrieved_block, message)
        try:
          reply_body = fut.result(timeout=90)
        except FuturesTimeoutError:
          reply_body = (
            "**That took a bit long.** I couldn't finish in time—please try sending a shorter question, or try again in a moment."
          )
          used_fallback = True
    except Exception as e:
      _mark_gemini_unavailable(e)
      print(f"[Sparky] ERROR: {e}")
      traceback.print_exc()
      reply_body = (
        "**I'm having trouble reaching the AI service right now.** "
        "Please try again shortly. If you were asking about safety-critical work, consult a qualified technician."
      )
      used_fallback = True

  now = datetime.utcnow()
  now_iso = now.isoformat() + "Z"
  updated_messages = prior_msgs + [
    {"role": "user", "content": message, "at": now_iso},
    {"role": "assistant", "content": reply_body, "at": now_iso},
  ]
  sparky_sessions.update_one(
    {"userId": resolved, "dateKey": date_key},
    {
      "$set": {"messages": updated_messages, "updatedAt": now},
      "$setOnInsert": {"createdAt": now},
    },
    upsert=True,
  )

  return jsonify(
    {
      "reply": reply_body,
      "messages": updated_messages,
      "dateKey": date_key,
      "sparkyFallback": used_fallback,
    }
  ), 200


@app.route("/api/assessment/random-questions", methods=["POST"])
def assessment_random_questions():
  body = request.get_json(silent=True) or {}
  user_id = body.get("userId", "").strip()
  email = normalize_email(body.get("email", ""))
  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  user = _find_user_by_ids(user_id, email)
  if not user:
    return jsonify({"error": "User not found."}), 404
  course = (user.get("course") or user.get("courseEnrolled") or "").strip()
  if course not in VALID_COURSES:
    return jsonify({"error": "You must enroll in Course 1, 2, or 3 before using automated assessment."}), 403

  level_key = _normalize_level(user.get("level"))
  pairs = _load_all_assessment_pairs(course)
  if not pairs:
    return jsonify({"error": "No assessment questions are available for this course yet."}), 404

  picked = _shuffle_assessment_by_level(pairs, level_key)
  out_q = []
  for p in picked:
    out_q.append(
      {
        "question": p.get("question", ""),
        "modelAnswer": p.get("modelAnswer", ""),
        "difficulty": p.get("difficulty", "Easy"),
        "knowledgeDimension": p.get("knowledgeDimension", "Factual"),
        "sourceUrl": p.get("sourceUrl", ""),
      }
    )
  return jsonify({"course": course, "level": level_key, "questions": out_q}), 200


@app.route("/api/subtopic/<path:subtopic_id>", methods=["GET"])
def get_subtopic(subtopic_id: str):
  """
  Fetch stored subtopic record from user_subtopics.
  Query params: userId|email, course
  """
  user_id = request.args.get("userId", "").strip()
  email = normalize_email(request.args.get("email", ""))
  course = (request.args.get("course") or "").strip()
  subtopic = subtopic_id.strip()

  if not user_id and not email:
    return jsonify({"error": "userId or email is required."}), 400
  if not course or course not in VALID_COURSES:
    return jsonify({"error": "Valid course is required."}), 400
  if not subtopic:
    return jsonify({"error": "subtopic id is required."}), 400

  user_query = {"userId": user_id} if user_id else {"email": email}
  user = users.find_one(user_query)
  if not user:
    return jsonify({"error": "User not found."}), 404
  resolved_user_id = user.get("userId") or user.get("email")
  doc = user_subtopics.find_one({"userId": resolved_user_id, "course": course, "subtopic": subtopic})
  if not doc:
    return jsonify({"error": "Subtopic not found."}), 404

  quiz = doc.get("quiz") if isinstance(doc.get("quiz"), dict) else {}
  out = {
    "userId": doc.get("userId"),
    "course": doc.get("course"),
    "topic": doc.get("topic", ""),
    "subtopic": doc.get("subtopic"),
    "studied": bool(doc.get("studied")),
    "contentGenerated": bool(doc.get("contentGenerated")),
    "content": doc.get("content", ""),
    "quiz": {
      "questions": quiz.get("questions", []),
      "userAnswers": quiz.get("userAnswers", []),
      "judgeResults": quiz.get("judgeResults", []),
      "score": quiz.get("score"),
      "submittedAt": quiz.get("submittedAt").isoformat() if quiz.get("submittedAt") else None,
    },
    "createdAt": doc.get("createdAt").isoformat() if doc.get("createdAt") else None,
    "lastViewedAt": doc.get("lastViewedAt").isoformat() if doc.get("lastViewedAt") else None,
  }
  return jsonify(out), 200

@app.route("/api/migrate/user-subtopics", methods=["POST"])
def migrate_user_subtopics():
  """
  One-time migration helper:
  - Moves personalized_content + quiz_submissions into user_subtopics
  - Leaves existing collections untouched
  """
  migrated_content = 0
  migrated_quiz = 0

  for doc in personalized_content.find({}):
    uid = (doc.get("userId") or "").strip()
    email = normalize_email(doc.get("email", ""))
    if not uid and email:
      user = users.find_one({"email": email})
      uid = user.get("userId") if user else email
    if not uid:
      continue
    course = (doc.get("course") or "").strip()
    subtopic = (doc.get("subtopicName") or "").strip()
    if not course or not subtopic:
      continue
    user_subtopics.update_one(
      {"userId": uid, "course": course, "subtopic": subtopic},
      {
        "$set": {
          "contentGenerated": bool(doc.get("content")),
          "content": doc.get("content", ""),
          "lastViewedAt": datetime.utcnow(),
        },
        "$setOnInsert": {
          "topic": "",
          "studied": False,
          "quiz": {},
          "createdAt": doc.get("createdAt") or datetime.utcnow(),
        },
      },
      upsert=True,
    )
    migrated_content += 1

  for doc in quiz_submissions.find({}):
    uid = (doc.get("userId") or "").strip()
    email = normalize_email(doc.get("email", ""))
    if not uid and email:
      user = users.find_one({"email": email})
      uid = user.get("userId") if user else email
    if not uid:
      continue
    course = (doc.get("course") or "").strip()
    subtopic = (doc.get("subtopicName") or "").strip()
    if not course or not subtopic:
      continue
    q = doc.get("questions", [])
    ua = doc.get("userAnswers", [])
    jr = doc.get("judgeResults", [])
    score = round(sum(int(x.get("marks", 0)) for x in jr if isinstance(x, dict)) / max(len(jr), 1), 2) if jr else None
    user_subtopics.update_one(
      {"userId": uid, "course": course, "subtopic": subtopic},
      {
        "$set": {
          "studied": True,
          "quiz": {
            "questions": q,
            "userAnswers": ua,
            "judgeResults": jr,
            "score": score,
            "submittedAt": doc.get("submittedAt") or datetime.utcnow(),
          },
          "lastViewedAt": datetime.utcnow(),
        },
        "$setOnInsert": {
          "topic": "",
          "contentGenerated": False,
          "content": "",
          "createdAt": datetime.utcnow(),
        },
      },
      upsert=True,
    )
    migrated_quiz += 1

  return jsonify({
    "message": "Migration completed.",
    "migratedContentDocs": migrated_content,
    "migratedQuizDocs": migrated_quiz,
  }), 200 

if __name__ == "__main__":
  port = int(os.getenv("PORT", "5000"))
  app.run(debug=True, use_reloader=False)