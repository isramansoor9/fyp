import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

type QAPair = { Question: string; Answer: string; Difficulty: string };
type QASource = { url?: string; transcript?: string; qa_pairs: QAPair[] };
type QAMap = Record<string, QASource[]>;

const LEVEL_MAP: Record<string, { primary: string[]; secondary: string[] }> = {
  easy: { primary: ["Easy"], secondary: ["Intermediate"] },
  intermediate: { primary: ["Intermediate"], secondary: ["Hard"] },
  advanced: { primary: ["Hard"], secondary: ["Intermediate"] },
};

function findBestTopicKey(keys: string[], subtopic: string): string | null {
  const s = subtopic.trim().toLowerCase();
  const exact = keys.find((k) => k.trim().toLowerCase() === s);
  if (exact) return exact;
  const contains = keys.find((k) => k.trim().toLowerCase().includes(s) || s.includes(k.trim().toLowerCase()));
  if (contains) return contains;
  return null;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function toQAItem(q: QAPair & { KnowledgeDimension?: string }) {
  return {
    question: q.Question,
    answer: q.Answer,
    difficulty: q.Difficulty,
    knowledgeDimension: q.KnowledgeDimension ?? "Factual",
    Question: q.Question,
    Answer: q.Answer,
    Difficulty: q.Difficulty,
    KnowledgeDimension: q.KnowledgeDimension ?? "Factual",
  };
}

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const level = request.nextUrl.searchParams.get("level") || "easy";
  const allForTopic = request.nextUrl.searchParams.get("all") === "true";

  if (!title) {
    return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
  }

  const decoded = decodeURIComponent(title);
  const levels = LEVEL_MAP[level] || LEVEL_MAP.easy;
  const primaryCount = 3;
  const secondaryCount = 2;

  try {
    const filePath = join(process.cwd(), "content1", "Course1QAs.json");
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Quiz data not found" }, { status: 404 });
    }

    const qaMap: QAMap = JSON.parse(readFileSync(filePath, "utf-8"));
    const keys = Object.keys(qaMap);
    const topicKey = findBestTopicKey(keys, decoded) || keys[0];

    const sources = qaMap[topicKey] || [];
    const allPairs: (QAPair & { KnowledgeDimension?: string })[] = [];
    sources.forEach((src) => {
      if (src.qa_pairs?.length) {
        src.qa_pairs.forEach((qa) => allPairs.push({ ...qa, KnowledgeDimension: (qa as { KnowledgeDimension?: string }).KnowledgeDimension }));
      }
    });

    if (allForTopic) {
      return NextResponse.json({
        questions: allPairs.slice(0, 50).map(toQAItem),
        quizQAs: allPairs.slice(0, 50).map((q) => ({ Question: q.Question, Answer: q.Answer, Difficulty: q.Difficulty, KnowledgeDimension: q.KnowledgeDimension ?? "Factual" })),
      });
    }

    const primary = shuffle(allPairs.filter((q) => levels.primary.includes(q.Difficulty)));
    const secondary = shuffle(allPairs.filter((q) => levels.secondary.includes(q.Difficulty)));
    const selected = [
      ...primary.slice(0, primaryCount),
      ...secondary.slice(0, secondaryCount),
    ];
    const needMore = 5 - selected.length;
    if (needMore > 0) {
      const remaining = shuffle(allPairs.filter((q) => !selected.includes(q)));
      selected.push(...remaining.slice(0, needMore));
    }
    const shuffled = shuffle(selected.length > 0 ? selected : allPairs.slice(0, 5));

    return NextResponse.json({
      questions: shuffled.map(toQAItem),
    });
  } catch (err) {
    console.error("Quiz API error:", err);
    return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
  }
}
