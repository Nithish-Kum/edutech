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

export interface LessonContent {
  introduction: string;
  learningObjectives: string[];
  content: {
    explanation: string;
    keyPoints: string[];
    examples: Array<{
      title: string;
      description: string;
      code?: string;
      language?: string;
    }>;
  };
  exercises: Array<{
    question: string;
    type: "multiple-choice" | "coding" | "text";
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
  }>;
  resources: Array<{
    title: string;
    type: "article" | "video" | "documentation";
    url: string;
    description: string;
  }>;
}

export interface EnhancedModule extends CourseModule {
  lessons?: Array<{
    id: string;
    title: string;
    content: LessonContent;
    completed?: boolean;
  }>;
}

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

export async function generateLessonContent(topic: string, moduleTitle: string, difficulty: string): Promise<LessonContent | null> {
  if (!OPENAI_API_KEY) return null;
  
  const system = `You are an expert educational content creator. Generate comprehensive lesson content in JSON format with the following structure:
  {
    "introduction": "Brief engaging introduction to the topic",
    "learningObjectives": ["Objective 1", "Objective 2"],
    "content": {
      "explanation": "Detailed explanation with examples",
      "keyPoints": ["Point 1", "Point 2"],
      "examples": [
        {
          "title": "Example title",
          "description": "Example description", 
          "code": "code snippet if applicable",
          "language": "programming language if applicable"
        }
      ]
    },
    "exercises": [
      {
        "question": "Exercise question",
        "type": "multiple-choice" | "coding" | "text",
        "options": ["A", "B", "C", "D"], 
        "correctAnswer": "A",
        "explanation": "Why this is correct"
      }
    ],
    "resources": [
      {
        "title": "Resource title",
        "type": "article" | "video" | "documentation",
        "url": "https://example.com",
        "description": "Brief description"
      }
    ]
  }`;
  
  const user = `Create comprehensive lesson content for the topic "${topic}" in module "${moduleTitle}" at ${difficulty} level. Make it practical and engaging with real-world examples.`;
  
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
        temperature: 0.6,
      }),
    });
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    const jsonStr = start >= 0 && end >= 0 ? content.slice(start, end + 1) : content;
    const parsed = JSON.parse(jsonStr);
    return parsed as LessonContent;
  } catch (_e) {
    return null;
  }
}

export async function askQuestion(context: string, question: string): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;
  const system = `You are an AI professor. Answer concisely and practically using the lesson context when relevant. Be encouraging and helpful.`;
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





