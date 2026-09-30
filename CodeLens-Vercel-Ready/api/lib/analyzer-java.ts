import type { CodeIssue } from "./analyzer";

type Rule = (code: string) => CodeIssue | null;

const rules: Rule[] = [
  (code) => {
    if (!/catch\s*\(\s*(?:final\s+)?(?:java\.lang\.)?(?:Exception|Throwable)\s+\w+\s*\)/.test(code)) {
      return null;
    }
    return {
      type: "Error Handling",
      message:
        "A catch block captures Exception (or Throwable), which swallows unrelated failures such as programming errors.",
      hints: [
        "Ask which checked exceptions the code inside the try block can actually throw.",
        "Java lets you catch several specific types, either in separate blocks or with a multi-catch using |.",
        "Replace the broad type with the concrete ones, for example catch (IOException | SQLException e).",
      ],
      solution: code.replace(
        /catch\s*\(\s*(?:final\s+)?(?:java\.lang\.)?(?:Exception|Throwable)\s+(\w+)\s*\)/g,
        "catch (IOException | IllegalArgumentException $1)",
      ),
      explanation:
        "Catching the specific exceptions you can recover from keeps NullPointerException and other bugs visible instead of quietly turning them into handled errors.",
    };
  },
  (code) => {
    if (!/new\s+(?:FileInputStream|FileOutputStream|FileReader|FileWriter|BufferedReader|BufferedWriter|Scanner|Socket|Connection)\s*\(/.test(code)) {
      return null;
    }
    if (/try\s*\(/.test(code)) return null;
    return {
      type: "Resource Management",
      message:
        "A closeable resource is created without try-with-resources, so it can stay open if an exception is thrown.",
      hints: [
        "Streams, readers, sockets and JDBC connections all implement AutoCloseable.",
        "A finally block works, but Java has dedicated syntax that closes resources for you.",
        "Declare the resource inside try (...) so it is closed automatically in every exit path.",
      ],
      solution: code.replace(
        /(?:final\s+)?(\w[\w.<>\[\]]*)\s+(\w+)\s*=\s*new\s+(FileInputStream|FileOutputStream|FileReader|FileWriter|BufferedReader|BufferedWriter|Scanner|Socket|Connection)\s*\(([^;]*)\)\s*;/,
        "try ($1 $2 = new $3($4)) {\n    // use $2 here\n}",
      ),
      explanation:
        "try-with-resources closes the resource on both the normal and the exceptional path, which prevents file-handle and connection leaks under load.",
    };
  },
  (code) => {
    if (!/["']\s*(?:==|!=)\s*\w|\w\s*(?:==|!=)\s*["']/.test(code)) return null;
    return {
      type: "Correctness",
      message:
        "Strings are compared with == or !=, which compares references instead of the text they hold.",
      hints: [
        "In Java, == asks whether two variables point at the same object.",
        "Only interned literals happen to share an identity; runtime-built strings do not.",
        "Use equals (or Objects.equals for possibly-null values) to compare contents.",
      ],
      solution: code.replace(
        /(\w+)\s*==\s*("(?:[^"\\]|\\.)*")/g,
        "$2.equals($1)",
      ),
      explanation:
        "equals compares character sequences, so the check keeps working for strings built at runtime from input, concatenation or I/O.",
    };
  },
  (code) => {
    if (!/\+=\s*[^;]*(?:"|\w)\s*;/.test(code)) return null;
    if (!/String\s+\w+\s*=/.test(code)) return null;
    if (!/for\s*\(|while\s*\(/.test(code)) return null;
    return {
      type: "Performance",
      message:
        "A String is being concatenated inside a loop, which allocates a new String on every iteration.",
      hints: [
        "String instances in Java are immutable.",
        "Think about how many intermediate objects a loop of n iterations creates.",
        "Accumulate into a StringBuilder and call toString() once at the end.",
      ],
      solution: code.replace(
        /String\s+(\w+)\s*=\s*"";/,
        "StringBuilder $1 = new StringBuilder();",
      ),
      explanation:
        "StringBuilder mutates one internal buffer, turning quadratic copying into a single linear pass over the characters.",
    };
  },
  (code) => {
    if (!/System\.out\.print(?:ln)?\s*\(/.test(code)) return null;
    return {
      type: "Observability",
      message:
        "Diagnostics are written with System.out, which cannot be filtered, levelled or redirected in production.",
      hints: [
        "Console output is unstructured and always on.",
        "Logging frameworks give you levels, context and per-environment configuration.",
        "Use a logger such as SLF4J: logger.info(\"...\", value).",
      ],
      solution: code.replace(/System\.out\.println\s*\(/g, "logger.info("),
      explanation:
        "A logger lets operators raise or lower verbosity without touching code, and keeps records machine-readable when something goes wrong.",
    };
  },
  (code) => {
    if (!/public\s+[\w<>\[\]]+\s+\w+\s*\([^)]*\)\s*\{[\s\S]{0,400}?\.\w+\s*\(/.test(code)) return null;
    if (!/(?:String|Object|List|Map)\s+(\w+)\s*(?:,|\))/.test(code)) return null;
    if (/Objects\.requireNonNull|!=\s*null|Optional\./.test(code)) return null;
    return {
      type: "Null Safety",
      message:
        "A reference parameter is dereferenced without any null check, so a null argument becomes a NullPointerException deep inside the method.",
      hints: [
        "Any object reference in Java can be null unless something guarantees otherwise.",
        "Failing fast at the boundary makes the caller's mistake obvious.",
        "Guard the parameter with Objects.requireNonNull, or model absence with Optional.",
      ],
      solution: code.replace(
        /(public\s+[\w<>\[\]]+\s+\w+\s*\((?:String|Object|List|Map)[\w<>\[\]]*\s+(\w+)[^)]*\)\s*\{)/,
        "$1\n    Objects.requireNonNull($2, \"$2 must not be null\");",
      ),
      explanation:
        "Validating at the entry point turns a confusing stack trace from inside the method into a clear message about the argument that was wrong.",
    };
  },
];

export function analyzeJava(code: string): { issue_count: number; issues: CodeIssue[] } {
  const issues = rules
    .map((rule) => rule(code))
    .filter((issue): issue is CodeIssue => issue !== null);

  return { issue_count: issues.length, issues };
}
