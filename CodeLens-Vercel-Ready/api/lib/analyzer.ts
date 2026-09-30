export type CodeIssue = {
  type: string;
  message: string;
  hints: string[];
  solution: string;
  explanation: string;
};

type Rule = (code: string) => CodeIssue | null;

const rules: Rule[] = [
  (code) => {
    if (!/except\s*:\s*(?:\n|$)/m.test(code)) return null;
    return {
      type: "Error Handling",
      message:
        "A bare except catches every kind of exception, including interrupts and system-exiting errors.",
      hints: [
        "Think about which exceptions your function can actually recover from.",
        "Python lets you name the exception type after the except keyword.",
        "Try catching Exception instead of leaving the handler open-ended.",
      ],
      solution: code.replace(/except\s*:/g, "except Exception:"),
      explanation:
        "Narrowing the handler keeps expected runtime failures recoverable while allowing interrupts and programming errors to surface during development.",
    };
  },
  (code) => {
    if (!/==\s*None|None\s*==/.test(code)) return null;
    return {
      type: "Python Style",
      message:
        "The code compares a value to None with equality, which can be surprising for custom objects.",
      hints: [
        "None is a singleton in Python.",
        "There is a dedicated identity operator for singleton checks.",
        "Replace the equality comparison with `is None`.",
      ],
      solution: code.replace(/==\s*None/g, "is None").replace(/None\s*==/g, "None is"),
      explanation:
        "Identity checks communicate that you are looking for the actual None singleton and avoid overloaded equality behavior.",
    };
  },
  (code) => {
    if (!/def\s+\w+\s*\([^)]*=\s*(?:\[\]|\{\}|set\(\))/.test(code)) return null;
    return {
      type: "State Bug",
      message:
        "A mutable list, dictionary, or set is used as a function default and will be shared between calls.",
      hints: [
        "Default arguments are created once, when Python defines the function.",
        "Ask what happens when the function mutates the default value.",
        "Use None as the default, then create a fresh collection inside the function.",
      ],
      solution: code.replace(
        /(def\s+\w+\s*\([^)]*?)(=\s*(?:\[\]|\{\}|set\(\)))/,
        "$1= None",
      ),
      explanation:
        "A fresh collection per call prevents state from leaking between otherwise unrelated invocations.",
    };
  },
  (code) => {
    if (!/\beval\s*\(|\bexec\s*\(/.test(code)) return null;
    return {
      type: "Security Risk",
      message:
        "Evaluating raw input as Python code can execute arbitrary instructions.",
      hints: [
        "Treat input from a user or file as untrusted data.",
        "Look for a parser or a small allowlist of supported values.",
        "For literal data, Python's ast.literal_eval is safer than eval.",
      ],
      solution: code.replace(/\beval\s*\(/g, "ast.literal_eval("),
      explanation:
        "A constrained parser can read supported literals without giving input access to Python's full execution environment.",
    };
  },
  (code) => {
    if (!/for\s+\w+\s+in\s+range\s*\(\s*len\s*\(/.test(code)) return null;
    return {
      type: "Readability",
      message:
        "The loop indexes into a sequence with range(len(...)), which hides the intent and can invite off-by-one mistakes.",
      hints: [
        "Python can iterate over the items in a sequence directly.",
        "If you need the position too, there is a built-in helper for pairs.",
        "Try replacing the range expression with enumerate.",
      ],
      solution: code.replace(
        /for\s+(\w+)\s+in\s+range\s*\(\s*len\s*\(\s*(\w+)\s*\)\s*\):/g,
        "for $1, item in enumerate($2):",
      ),
      explanation:
        "enumerate makes the index-and-item relationship explicit and avoids repeatedly indexing the original sequence.",
    };
  },
];

export function analyzePython(code: string): { issue_count: number; issues: CodeIssue[] } {
  const issues = rules
    .map((rule) => rule(code))
    .filter((issue): issue is CodeIssue => issue !== null);

  return { issue_count: issues.length, issues };
}