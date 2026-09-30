import { analyzePython, type CodeIssue } from "./analyzer";
import { analyzeJava } from "./analyzer-java";
import { analyzeCpp } from "./analyzer-cpp";

export type AnalysisPayload = { issue_count: number; issues: CodeIssue[] };

const analyzers: Record<string, (code: string) => AnalysisPayload> = {
  python: analyzePython,
  java: analyzeJava,
  cpp: analyzeCpp,
};

/**
 * Shared transport-agnostic entry point used by both the Express route and the
 * Vercel serverless function. The response shape is unchanged.
 */
export function analyzeRequestBody(body: unknown):
  | { ok: true; data: AnalysisPayload }
  | { ok: false; status: 400; error: string; issues: unknown } {
  const candidate = body as { code?: unknown; language?: unknown } | null;
  const code = candidate?.code;
  const language = candidate?.language ?? "python";
  const validLanguage = language === "python" || language === "java" || language === "cpp";

  if (typeof code !== "string" || code.trim().length === 0 || code.length > 50_000 || !validLanguage) {
    return {
      ok: false,
      status: 400,
      error:
        "Code must be a non-empty string no longer than 50,000 characters, and language must be python, java or cpp.",
      issues: [],
    };
  }

  const analyze = analyzers[language] ?? analyzePython;

  return { ok: true, data: analyze(code) };
}
