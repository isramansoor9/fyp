"""
Production-oriented hybrid RAG pipeline:
- Pinecone vector search (semantic)
- Elasticsearch BM25 (keyword)
- Score fusion
- Cross-encoder reranking
- Query enhancement
- Recommendation extraction from generated content
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any

from sentence_transformers import SentenceTransformer, CrossEncoder
from pinecone import Pinecone
from elasticsearch import Elasticsearch


@dataclass
class RAGDoc:
  chunkId: str
  text: str
  url: str
  topic: str
  vector_score: float = 0.0
  bm25_score: float = 0.0
  hybrid_score: float = 0.0
  rerank_score: float = 0.0


_embed_model: SentenceTransformer | None = None
_rerank_model: CrossEncoder | None = None
_pc_index = None
_es_client: Elasticsearch | None = None
_retrieval_cache: dict[str, list[dict[str, Any]]] = {}


def _get_embed_model() -> SentenceTransformer:
  global _embed_model
  if _embed_model is None:
    _embed_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
  return _embed_model


def _get_rerank_model() -> CrossEncoder:
  global _rerank_model
  if _rerank_model is None:
    _rerank_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
  return _rerank_model


def _get_pinecone_index():
  global _pc_index
  if _pc_index is None:
    api_key = os.getenv("PINECONE_API_KEY", "").strip()
    index_name = os.getenv("PINECONE_INDEX_NAME", "teachusdata")
    if not api_key:
      raise RuntimeError("PINECONE_API_KEY is not configured.")
    pc = Pinecone(api_key=api_key)
    _pc_index = pc.Index(index_name)
  return _pc_index


def _get_es_client() -> Elasticsearch:
  global _es_client
  if _es_client is None:
    url = os.getenv("ELASTIC_URL", "").strip()
    api_key = os.getenv("ELASTIC_API_KEY", "").strip()
    if not url or not api_key:
      raise RuntimeError("ELASTIC_URL/ELASTIC_API_KEY not configured.")
    _es_client = Elasticsearch(url, api_key=api_key)
  return _es_client


def _normalize_scores(values: list[float]) -> list[float]:
  if not values:
    return []
  v_min = min(values)
  v_max = max(values)
  if v_max == v_min:
    return [1.0 for _ in values]
  return [(v - v_min) / (v_max - v_min) for v in values]


def _clip_text(text: str, max_chars: int = 500) -> str:
  return (text or "").strip()[:max_chars]


def enhance_query(base_content: str, quiz_feedback: str, last_topic_recap: str) -> str:
  """
  Build concise retrieval query from:
  - current topic/base content
  - weak areas in quiz feedback
  - previous topic recap
  """
  topic_hint = (base_content or "").splitlines()[0][:120] if base_content else ""
  weak = (quiz_feedback or "").strip()
  recap = (last_topic_recap or "").strip()
  parts = [p for p in [topic_hint, weak, recap] if p]
  if not parts:
    return "Explain this subtopic with practical examples and troubleshooting."
  return "Explain " + " | ".join(parts[:3]) + " focusing on weak areas with practical examples."


def hybrid_search(query: str, top_k: int = 15) -> list[dict[str, Any]]:
  """
  Hybrid retrieval:
  - vector search in Pinecone
  - BM25 search in Elasticsearch
  - min-max normalize each source
  - merge by chunkId
  - hybrid = 0.7*vector + 0.3*bm25
  """
  cache_key = f"{query}::k={top_k}"
  if cache_key in _retrieval_cache:
    return _retrieval_cache[cache_key]

  embed_model = _get_embed_model()
  query_vec = embed_model.encode(query).tolist()

  # Pinecone vector search
  index = _get_pinecone_index()
  pc_res = index.query(vector=query_vec, top_k=15, include_metadata=True, namespace="default")
  pc_matches = getattr(pc_res, "matches", []) or []

  vector_docs: list[RAGDoc] = []
  vector_scores_raw: list[float] = []
  for m in pc_matches:
    md = getattr(m, "metadata", {}) or {}
    chunk_id = md.get("chunkId") or getattr(m, "id", "")
    if not chunk_id:
      continue
    vector_scores_raw.append(float(getattr(m, "score", 0.0) or 0.0))
    vector_docs.append(
      RAGDoc(
        chunkId=str(chunk_id),
        text=_clip_text(md.get("text", "")),
        url=md.get("source_url", md.get("url", "")),
        topic=md.get("topic", ""),
      )
    )

  vector_scores = _normalize_scores(vector_scores_raw)
  for i, s in enumerate(vector_scores):
    vector_docs[i].vector_score = s

  # Elasticsearch BM25 search
  es = _get_es_client()
  es_index = os.getenv("ELASTIC_INDEX_NAME", "teachus")
  es_res = es.search(
    index=es_index,
    size=15,
    query={"match": {"text": {"query": query}}},
  )
  es_hits = (es_res.get("hits", {}) or {}).get("hits", []) or []

  bm25_docs: list[RAGDoc] = []
  bm25_scores_raw: list[float] = []
  for h in es_hits:
    src = h.get("_source", {}) or {}
    chunk_id = src.get("chunkId") or h.get("_id", "")
    if not chunk_id:
      continue
    bm25_scores_raw.append(float(h.get("_score", 0.0) or 0.0))
    bm25_docs.append(
      RAGDoc(
        chunkId=str(chunk_id),
        text=_clip_text(src.get("text", "")),
        url=src.get("url", ""),
        topic=src.get("topic", ""),
      )
    )

  bm25_scores = _normalize_scores(bm25_scores_raw)
  for i, s in enumerate(bm25_scores):
    bm25_docs[i].bm25_score = s

  # Merge by chunkId
  merged: dict[str, RAGDoc] = {}
  for d in vector_docs:
    merged[d.chunkId] = d
  for d in bm25_docs:
    if d.chunkId in merged:
      ex = merged[d.chunkId]
      ex.bm25_score = d.bm25_score
      if not ex.text and d.text:
        ex.text = d.text
      if not ex.url and d.url:
        ex.url = d.url
      if not ex.topic and d.topic:
        ex.topic = d.topic
    else:
      merged[d.chunkId] = d

  out = []
  for d in merged.values():
    d.hybrid_score = 0.7 * d.vector_score + 0.3 * d.bm25_score
    out.append(
      {
        "chunkId": d.chunkId,
        "text": d.text,
        "url": d.url,
        "topic": d.topic,
        "vector_score": d.vector_score,
        "bm25_score": d.bm25_score,
        "hybrid_score": d.hybrid_score,
      }
    )

  out.sort(key=lambda x: x["hybrid_score"], reverse=True)
  out = out[:top_k]
  _retrieval_cache[cache_key] = out
  return out


def rerank(query: str, docs: list[dict[str, Any]], top_k: int = 5) -> list[dict[str, Any]]:
  if not docs:
    return []
  model = _get_rerank_model()
  pairs = [(query, d.get("text", "")) for d in docs]
  scores = model.predict(pairs)
  scored = []
  for d, s in zip(docs, scores):
    x = dict(d)
    x["rerank_score"] = float(s)
    scored.append(x)
  scored.sort(key=lambda x: x["rerank_score"], reverse=True)
  return scored[:top_k]


def retrieve_context(query: str) -> list[dict[str, Any]]:
  docs = hybrid_search(query=query, top_k=15)
  docs = rerank(query=query, docs=docs, top_k=5)
  return [
    {
      "chunkId": d.get("chunkId", ""),
      "text": _clip_text(d.get("text", ""), max_chars=500),
      "url": d.get("url", ""),
      "topic": d.get("topic", ""),
    }
    for d in docs
  ]


def recommend_resources_from_content(generated_content: str, top_k: int = 5) -> list[dict[str, str]]:
  """
  Post-generation recommendation:
  - embed generated content
  - query Pinecone
  - return unique source_url/topic
  """
  if not generated_content.strip():
    return []
  embed_model = _get_embed_model()
  vec = embed_model.encode(generated_content[:2000]).tolist()
  index = _get_pinecone_index()
  res = index.query(vector=vec, top_k=top_k, include_metadata=True, namespace="default")
  matches = getattr(res, "matches", []) or []
  seen = set()
  recs = []
  for m in matches:
    md = getattr(m, "metadata", {}) or {}
    url = md.get("source_url", md.get("url", ""))
    topic = md.get("topic", "")
    if not url or url in seen:
      continue
    seen.add(url)
    recs.append({"url": url, "topic": topic})
  return recs[:top_k]

