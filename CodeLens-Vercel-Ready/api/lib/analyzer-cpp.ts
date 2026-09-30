import type { CodeIssue } from "./analyzer";

type Rule = (code: string) => CodeIssue | null;

const rules: Rule[] = [
  (code) => {
    if (!/(?:^|[^\w])new\s+[\w:<>]+/.test(code)) return null;
    if (/std::(?:unique_ptr|shared_ptr|make_unique|make_shared)/.test(code)) return null;
    return {
      type: "Memory Management",
      message:
        "Memory is allocated with raw new, so every exit path has to remember the matching delete.",
      hints: [
        "Ask what happens to the allocation if the function returns early or throws.",
        "C++ ties resource lifetime to object lifetime — that idiom is called RAII.",
        "Hold the allocation in std::unique_ptr, created with std::make_unique.",
      ],
      solution: code
        .replace(
          /([\w:<>]+)\s*\*\s*(\w+)\s*=\s*new\s+([\w:<>]+)\s*\(([^;]*)\)\s*;/g,
          "std::unique_ptr<$1> $2 = std::make_unique<$3>($4);",
        )
        .replace(/(?:^|\n)\s*delete\s+\w+\s*;/g, ""),
      explanation:
        "A smart pointer releases the memory in its destructor, so the object is freed on normal returns, early returns and exceptions alike.",
    };
  },
  (code) => {
    if (!/\bdelete\s+(\w+)\s*;/.test(code)) return null;
    if (/\bdelete\s*\[\s*\]/.test(code) === false && /new\s+[\w:<>]+\s*\[/.test(code)) {
      return {
        type: "Memory Management",
        message:
          "An array allocated with new[] is released with plain delete, which is undefined behaviour.",
        hints: [
          "Array allocation and scalar allocation use different bookkeeping.",
          "The delete form has to match the new form exactly.",
          "Use delete[] — or better, std::vector, which sizes and frees itself.",
        ],
        solution: code.replace(/\bdelete\s+(\w+)\s*;/g, "delete[] $1;"),
        explanation:
          "Matching delete[] to new[] runs the destructor for every element and frees the block the way the runtime allocated it.",
      };
    }
    return null;
  },
  (code) => {
    if (!/(?:^|[^\w])([\w:<>]+)\s*\*\s*(\w+)\s*;/m.test(code)) return null;
    return {
      type: "Undefined Behaviour",
      message:
        "A pointer is declared without an initializer, so it holds an indeterminate value until something assigns to it.",
      hints: [
        "An uninitialized local pointer does not start out as null in C++.",
        "Dereferencing or even comparing that value is undefined behaviour.",
        "Give the pointer a value at the point of declaration — nullptr at minimum.",
      ],
      solution: code.replace(
        /((?:^|\n)\s*)([\w:<>]+)(\s*\*\s*)(\w+)\s*;/g,
        "$1$2$3$4 = nullptr;",
      ),
      explanation:
        "Initializing to nullptr makes the empty state explicit and testable, instead of leaving the variable pointing at whatever was previously on the stack.",
    };
  },
  (code) => {
    if (!/\[\s*(?:\w+|\w+\s*[+-]\s*\d+)\s*\]/.test(code)) return null;
    if (!/for\s*\(|while\s*\(/.test(code)) return null;
    if (/\.at\s*\(|\.size\s*\(\s*\)\s*(?:>|>=|<|<=)|<\s*\w+\.size\s*\(\s*\)/.test(code)) return null;
    return {
      type: "Bounds Safety",
      message:
        "An index is used to read into a buffer without any bounds check, so an out-of-range value reads past the end.",
      hints: [
        "operator[] on arrays and std::vector performs no range checking.",
        "Consider what the index can be on the first and last iteration.",
        "Compare against .size() before indexing, or use .at() which throws on a bad index.",
      ],
      solution: code.replace(/(\w+)\s*\[\s*(\w+)\s*\]/g, "$1.at($2)"),
      explanation:
        "A checked access converts a silent memory-corruption bug into an immediate, diagnosable error at the point where the index went wrong.",
    };
  },
  (code) => {
    if (!/\b(?:strcpy|strcat|sprintf|gets)\s*\(/.test(code)) return null;
    return {
      type: "Security Risk",
      message:
        "An unbounded C string function is used, which will happily write past the end of the destination buffer.",
      hints: [
        "These functions copy until a terminating null byte, not until the buffer is full.",
        "The destination size is never passed in, so it cannot be respected.",
        "Prefer std::string, or the bounded forms such as snprintf.",
      ],
      solution: code
        .replace(/\bstrcpy\s*\(/g, "snprintf(")
        .replace(/\bsprintf\s*\(/g, "snprintf(")
        .replace(/\bgets\s*\(/g, "std::getline(std::cin, "),
      explanation:
        "Bounded copies (or std::string, which owns and grows its own storage) remove the classic stack-smashing buffer overflow entirely.",
    };
  },
  (code) => {
    if (!/(?:void|int|bool|double|float|auto|std::string)\s+\w+\s*\(\s*(?:const\s+)?std::(?:vector|string|map|set)\s*(?:<[^>]*>)?\s+\w+/.test(code)) {
      return null;
    }
    if (/&\s*\w+\s*[,)]/.test(code)) return null;
    return {
      type: "Performance",
      message:
        "A standard container is taken by value, so the whole thing is copied on every call.",
      hints: [
        "Passing by value invokes the copy constructor for the container and all its elements.",
        "The function only needs to read the data, not own it.",
        "Take a const reference: const std::vector<int>& values.",
      ],
      solution: code.replace(
        /(std::(?:vector|string|map|set)\s*(?:<[^>]*>)?)\s+(\w+)(\s*[,)])/g,
        "const $1& $2$3",
      ),
      explanation:
        "A const reference gives read access without allocating or copying, which matters as soon as the container holds more than a handful of elements.",
    };
  },
  (code) => {
    if (!/\bclass\s+\w+/.test(code)) return null;
    if (!/\bvirtual\b/.test(code)) return null;
    if (/virtual\s+~\w+\s*\(/.test(code)) return null;
    return {
      type: "Correctness",
      message:
        "A class declares virtual functions but no virtual destructor, so deleting through a base pointer is undefined.",
      hints: [
        "Virtual functions signal that the class is meant to be inherited from.",
        "Think about which destructor runs when a derived object is deleted via a base pointer.",
        "Declare virtual ~ClassName() = default; in the base class.",
      ],
      solution: code.replace(
        /(class\s+(\w+)[^{]*\{\s*(?:public:)?)/,
        "$1\n    virtual ~$2() = default;",
      ),
      explanation:
        "A virtual destructor makes the destructor call dynamically dispatched, so the derived part of the object is destroyed and its resources are released.",
    };
  },
];

export function analyzeCpp(code: string): { issue_count: number; issues: CodeIssue[] } {
  const issues = rules
    .map((rule) => rule(code))
    .filter((issue): issue is CodeIssue => issue !== null);

  return { issue_count: issues.length, issues };
}
