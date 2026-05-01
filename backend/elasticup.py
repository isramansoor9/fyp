import json
import os
from pathlib import Path
from tqdm import tqdm
from elasticsearch import Elasticsearch, helpers
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

# =========================
# 🔐 CONFIG
# =========================
ELASTIC_URL = (os.getenv("ELASTIC_URL") or "").strip()
ELASTIC_API_KEY = (os.getenv("ELASTIC_API_KEY") or "").strip()
INDEX_NAME = os.getenv("ELASTIC_INDEX_NAME", "teachus")

if not ELASTIC_URL or not ELASTIC_API_KEY:
    raise ValueError("❌ Missing ELASTIC_URL or ELASTIC_API_KEY in .env")

# =========================
# 🔹 CONNECT
# =========================
es = Elasticsearch(
    ELASTIC_URL,
    api_key=ELASTIC_API_KEY
)

if not es.ping():
    raise ValueError("❌ Cannot connect to Elasticsearch")

print("✅ Connected to Elasticsearch")

# =========================
# 🔹 CREATE INDEX (BM25)
# =========================
if not es.indices.exists(index=INDEX_NAME):
    es.indices.create(
        index=INDEX_NAME,
        body={
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0
            },
            "mappings": {
                "properties": {
                    "docId": {"type": "keyword"},
                    "chunkId": {"type": "keyword"},
                    "topic": {"type": "keyword"},
                    "url": {"type": "keyword"},

                    # 🔥 BM25 FIELD
                    "text": {
                        "type": "text",
                        "analyzer": "standard"
                    },

                    "chunkIndex": {"type": "integer"},
                    "totalChunks": {"type": "integer"},
                    "content_type": {"type": "keyword"}
                }
            }
        }
    )
    print(f"✅ Index '{INDEX_NAME}' created")
else:
    print(f"ℹ️ Index '{INDEX_NAME}' already exists")

# =========================
# 🔹 LOAD JSON
# =========================
json_path = Path(
    r"C:/Users/hp/Teachsss/UsableData/scrap_chunk2.json"
)

if not json_path.exists():
    raise FileNotFoundError("❌ JSON file not found")

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# =========================
# 🔹 HELPERS
# =========================
def clean_text(text):
    return " ".join(text.replace("\n", " ").split()).strip()

# =========================
# 🔹 BULK INGEST
# =========================
actions = []
BATCH_SIZE = 500
total_docs = 0

for topic, chunks in data.items():
    if not isinstance(chunks, list):
        continue

    for chunk in tqdm(chunks, desc=f"Processing {topic}", leave=False):
        if not isinstance(chunk, dict):
            continue

        text = clean_text(chunk.get("transcript", ""))
        if not text or len(text.split()) < 30:
            continue

        doc_id = chunk.get("docId")
        chunk_id = chunk.get("chunkId")

        doc = {
            "docId": doc_id,
            "chunkId": chunk_id,
            "topic": topic,
            "url": chunk.get("url", ""),
            "text": text,
            "chunkIndex": chunk.get("chunkIndex", 0),
            "totalChunks": chunk.get("totalChunks", 1),
            "content_type": "youtube"
        }

        actions.append({
            "_index": INDEX_NAME,
            "_id": chunk_id,
            "_source": doc
        })

        total_docs += 1

        # 🔥 BULK INSERT
        if len(actions) >= BATCH_SIZE:
            helpers.bulk(es, actions)
            actions = []

# =========================
# 🔹 FINAL FLUSH
# =========================
if actions:
    helpers.bulk(es, actions)

print(f"✅ Upload complete! Indexed {total_docs} documents.")