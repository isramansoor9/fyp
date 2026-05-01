import os
import json
import uuid
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

load_dotenv(Path(__file__).resolve().parent / ".env")

# === Pinecone Setup ===
api_key = os.getenv("PINECONE_API_KEY")
if not api_key:
    raise ValueError("PINECONE_API_KEY is not set — add it to backend/.env (never commit secrets).")

index_name = os.getenv("PINECONE_INDEX_NAME", "teachusdata")
region = "us-east-1"
dimension = 384

pc = Pinecone(api_key=api_key)

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=dimension,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region=region)
    )

index = pc.Index(index_name)

# === Embedding Model ===
model = SentenceTransformer("all-MiniLM-L6-v2")

# === Load CLEANED JSON ===
json_file_path = Path(
    r"C:/Users/hp/Teachsss/UsableData/scrap_chunk2.json"
)

if not json_file_path.exists():
    raise FileNotFoundError("❌ JSON file not found")

with json_file_path.open("r", encoding="utf-8") as f:
    data = json.load(f)

vectors_to_upsert = []

# === CORRECT LOOP (topic → chunks) ===
for topic, chunks in data.items():
    if not isinstance(chunks, list):
        continue

    for chunk in tqdm(chunks, desc=f"Processing: {topic}", leave=False):
        if not isinstance(chunk, dict):
            continue

        transcript = chunk.get("transcript", "").strip()
        url = chunk.get("url", "unknown")
        doc_id = chunk.get("docId", url)
        chunk_id = chunk.get("chunkId", str(uuid.uuid4()))
        chunk_index = chunk.get("chunkIndex", 0)
        total_chunks = chunk.get("totalChunks", 1)

        if not transcript:
            continue

        embedding = model.encode(transcript).tolist()

        # ✅ METADATA WITH CHUNK INFORMATION
        metadata = {
            "source_url": url,
            "text": transcript,
            "docId": doc_id,
            "chunkId": chunk_id,
            "chunkIndex": chunk_index,
            "totalChunks": total_chunks
        }

        vectors_to_upsert.append({
            "id": chunk_id,
            "values": embedding,
            "metadata": metadata
        })

# === HARD SAFETY CHECK ===
assert len(vectors_to_upsert) > 0, "❌ ZERO vectors created — check JSON keys"

print(f"✅ Total vectors prepared: {len(vectors_to_upsert)}")

# === Upload to Pinecone ===
batch_size = 100
for i in tqdm(
    range(0, len(vectors_to_upsert), batch_size),
    desc="Uploading to Pinecone"
):
    index.upsert(
        vectors=vectors_to_upsert[i:i + batch_size],
        namespace="default"
    )

print("✅ Upload complete!")