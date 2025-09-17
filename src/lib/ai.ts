type CourseModule = {
  id: string;
  title: string;
  duration?: string;
  topics?: string[];
};

export type GeneratedCourseData = {
  title: string;
  description?: string;
  estimatedDuration?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  modules: CourseModule[];
};

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;

export const isAIEnabled = () => Boolean(OPENAI_API_KEY);

export async function generateCourseOutline(topic: string): Promise<GeneratedCourseData | null> {
  if (!OPENAI_API_KEY) return null;
  const system = `You are an expert course designer. Return ONLY valid JSON for a practical, project-based course outline with fields: title, description, estimatedDuration, difficulty (Beginner|Intermediate|Advanced), modules: [{id,title,duration,topics[]}]. Duration values can be approximate strings.`;
  const user = `Create a concise, hands-on course outline for the topic: "${topic}".`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.4,
      }),
    });
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonStr = start >= 0 && end >= 0 ? content.slice(start, end + 1) : content;
    const parsed = JSON.parse(jsonStr);
    // basic validation
    if (!parsed?.modules || !Array.isArray(parsed.modules)) return null;
    // ensure ids
    parsed.modules = parsed.modules.map((m: any, idx: number) => ({ id: m.id ?? `module-${idx + 1}`, ...m }));
    return parsed as GeneratedCourseData;
  } catch (_e) {
    return null;
  }
}

export async function askQuestion(context: string, question: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  const system = `You are an AI professor. Answer concisely and practically using the lesson context when relevant.`;
  const user = `Context:\n${context}\n\nQuestion: ${question}`;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.5,
      }),
    });
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? null;
    return content;
  } catch (_e) {
    return null;
  }
}





