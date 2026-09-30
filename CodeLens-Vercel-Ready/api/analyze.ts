import { analyzeRequestBody } from "./lib/analyze-request.js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = analyzeRequestBody(body);

    if (!result.ok) {
      return Response.json(
        {
          error: result.error,
          issues: result.issues,
        },
        {
          status: result.status,
        }
      );
    }

    return Response.json(result.data);
  } catch {
    return Response.json(
      {
        error: "Invalid request body",
        issues: [],
      },
      {
        status: 400,
      }
    );
  }
}
