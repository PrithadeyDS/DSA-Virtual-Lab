import type { CodeIssue } from "./analyzer.js";

type Rule = (code: string) => CodeIssue | null;

const rules: Rule[] = [
  (code) => {
    if (!/\bgets\s*\(/.test(code)) return null;

    return {
      type: "Security Risk",
      message: "gets() cannot limit how many characters are written into the destination buffer.",
      hints: [
        "Ask what happens when the user types more characters than the array can hold.",
        "The input function should know the size of the destination buffer.",
        "Use fgets(buffer, sizeof buffer, stdin) instead."
      ],
      solution: code.replace(
        /\bgets\s*\(\s*(\w+)\s*\)/g,
        "fgets($1, sizeof $1, stdin)"
      ),
      explanation:
        "fgets receives the buffer size, so it can stop before writing beyond the allocated array."
    };
  },

  (code) => {
    if (!/\b(?:strcpy|strcat|sprintf)\s*\(/.test(code)) return null;

    return {
      type: "Buffer Safety",
      message: "An unbounded C string function can write past the destination array.",
      hints: [
        "These functions do not automatically know the destination capacity.",
        "A long source string can overflow the target buffer.",
        "Use a bounded alternative such as snprintf."
      ],
      solution: code
        .replace(/\bsprintf\s*\(/g, "snprintf(")
        .replace(/\bstrcpy\s*\(/g, "/* use a bounded copy */ strcpy("),
      explanation:
        "Passing or checking the destination capacity prevents writes beyond the end of the buffer."
    };
  },

  (code) => {
    if (!/\b(?:int|char|float|double|long|short|void)\s*\*\s*\w+\s*;/.test(code)) {
      return null;
    }

    return {
      type: "Undefined Behaviour",
      message: "A pointer is declared without being initialized.",
      hints: [
        "A local pointer does not automatically start as NULL.",
        "Dereferencing an indeterminate pointer is undefined behaviour.",
        "Initialize the pointer to NULL or make it point to valid storage."
      ],
      solution: code.replace(
        /((?:int|char|float|double|long|short|void)\s*\*\s*)(\w+)\s*;/g,
        "$1$2 = NULL;"
      ),
      explanation:
        "Initializing the pointer gives it a defined state before it is tested or dereferenced."
    };
  },

  (code) => {
    if (!/\bmalloc\s*\(/.test(code)) return null;
    if (/==\s*NULL|!=\s*NULL|if\s*\(\s*!\s*\w+\s*\)/.test(code)) return null;

    return {
      type: "Memory Safety",
      message: "Memory returned by malloc() is used without checking whether allocation succeeded.",
      hints: [
        "malloc can return NULL.",
        "Dereferencing NULL will crash the program.",
        "Check the returned pointer before using the allocation."
      ],
      solution:
        code + "\n\n/* After malloc: */\nif (ptr == NULL) {\n    return;\n}",
      explanation:
        "Checking allocation failure prevents the program from dereferencing a NULL pointer."
    };
  },

  (code) => {
    if (!/for\s*\([^;]*;[^;]*<=/.test(code)) return null;
    if (!/\w+\s*\[\s*\w+\s*\]/.test(code)) return null;

    return {
      type: "Bounds Safety",
      message: "A loop using <= while indexing an array may run one element past the valid range.",
      hints: [
        "For an array with count elements, the last valid index is count - 1.",
        "Check the loop condition when i reaches count.",
        "Use i < count when count represents the number of elements."
      ],
      solution: code.replace(/<=\s*(\w+)/g, "< $1"),
      explanation:
        "Using a strict less-than comparison keeps the index within 0 through count - 1."
    };
  }
];

export function analyzeC(code: string): {
  issue_count: number;
  issues: CodeIssue[];
} {
  const issues = rules
    .map((rule) => rule(code))
    .filter((issue): issue is CodeIssue => issue !== null);

  return {
    issue_count: issues.length,
    issues
  };
}
