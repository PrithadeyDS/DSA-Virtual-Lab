export type DsaLanguage = "c" | "cpp" | "java" | "python";

export type VisualNode = {
  id: string;
  value: number;
  status?: "normal" | "active" | "new" | "visited" | "deleted";
};

export type LinkedListVisualState = {
  nodes: VisualNode[];
  headIndex: number | null;
  newNode?: VisualNode;
  newNodePointsTo?: number | null;
};

export type AlgorithmStep =  {
  lineByLanguage: Partial<Record<DsaLanguage, number>>;
  title: string;
  explanation: string;
  visual: LinkedListVisualState;
};

export type AlgorithmLesson = {
  id: string;
  title: string;
  category: string;

  timeComplexity: string;
  spaceComplexity: string;

  code: Record<DsaLanguage, string[]>;

  steps: AlgorithmStep[];
};