import type {
  AlgorithmLesson,
  LinkedListVisualState,
  VisualNode,
} from "../types";

function makeNodes(
  values: number[],
  activeIndex?: number
): VisualNode[] {
  return values.map((value, index) => ({
    id: `node-${index}-${value}`,
    value,
    status:
      index === activeIndex
        ? "active"
        : "normal",
  }));
}

/* =========================================================
   INSERT AT BEGINNING
========================================================= */

export function createInsertBeginningLesson(
  values: number[],
  newValue: number
): AlgorithmLesson {
  const originalNodes = makeNodes(values);

  return {
    id: "linked-list-insert-beginning",

    title: "Insert at Beginning",

    category: "Singly Linked List",

    timeComplexity: "O(1)",

    spaceComplexity: "O(1)",

    code: {
      c: [
        "void insertAtBeginning(struct Node** head, int value) {",
        "    struct Node* newNode = malloc(sizeof(struct Node));",
        "    newNode->data = value;",
        "    newNode->next = *head;",
        "    *head = newNode;",
        "}",
      ],

      cpp: [
        "void insertAtBeginning(Node*& head, int value) {",
        "    Node* newNode = new Node();",
        "    newNode->data = value;",
        "    newNode->next = head;",
        "    head = newNode;",
        "}",
      ],

      java: [
        "void insertAtBeginning(int value) {",
        "    Node newNode = new Node(value);",
        "    newNode.next = head;",
        "    head = newNode;",
        "}",
      ],

      python: [
        "def insert_at_beginning(self, value):",
        "    new_node = Node(value)",
        "    new_node.next = self.head",
        "    self.head = new_node",
      ],
    },

    steps: [
      {
        lineByLanguage: {
          c: 1,
          cpp: 1,
          java: 1,
          python: 1,
        },

        title: "Initial linked list",

        explanation:
          "HEAD currently points to the first node of the linked list.",

        visual: {
          headIndex: values.length
            ? 0
            : null,

          nodes: originalNodes,
        },
      },

      {
        lineByLanguage: {
          c: 2,
          cpp: 2,
          java: 2,
          python: 2,
        },

        title: "Create the new node",

        explanation:
          `Create a new node that will store ${newValue}. It is not connected to the list yet.`,

        visual: {
          headIndex: values.length
            ? 0
            : null,

          nodes: originalNodes,

          newNode: {
            id: "new-node",
            value: newValue,
            status: "new",
          },
        },
      },

      {
        lineByLanguage: {
          c: 3,
          cpp: 3,
          java: 2,
          python: 2,
        },

        title: "Store the data",

        explanation:
          `The value ${newValue} is stored inside the new node.`,

        visual: {
          headIndex: values.length
            ? 0
            : null,

          nodes: originalNodes,

          newNode: {
            id: "new-node",
            value: newValue,
            status: "active",
          },
        },
      },

      {
        lineByLanguage: {
          c: 4,
          cpp: 4,
          java: 3,
          python: 3,
        },

        title: "Connect to the old HEAD",

        explanation:
          "The new node's next pointer is set to the node currently pointed to by HEAD.",

        visual: {
          headIndex: values.length
            ? 0
            : null,

          nodes: originalNodes,

          newNode: {
            id: "new-node",
            value: newValue,
            status: "active",
          },

          newNodePointsTo:
            values.length ? 0 : null,
        },
      },

      {
        lineByLanguage: {
          c: 5,
          cpp: 5,
          java: 4,
          python: 4,
        },

        title: "Move HEAD",

        explanation:
          `HEAD now points to ${newValue}. The new node becomes the first node of the list.`,

        visual: {
          headIndex: 0,

          nodes: makeNodes([
            newValue,
            ...values,
          ]),
        },
      },
    ],
  };
}

/* =========================================================
   INSERT AT END
========================================================= */

export function createInsertEndLesson(
  values: number[],
  newValue: number
): AlgorithmLesson {
  const steps: AlgorithmLesson["steps"] =
    [];

  steps.push({
    lineByLanguage: {
      c: 1,
      cpp: 1,
      java: 1,
      python: 1,
    },

    title: "Initial linked list",

    explanation:
      "To insert at the end of a singly linked list, we first need to reach the last node.",

    visual: {
      headIndex: values.length
        ? 0
        : null,

      nodes: makeNodes(values),
    },
  });

  steps.push({
    lineByLanguage: {
      c: 2,
      cpp: 2,
      java: 2,
      python: 2,
    },

    title: "Create the new node",

    explanation:
      `Create a new node containing ${newValue}. Its next pointer will ultimately be NULL.`,

    visual: {
      headIndex: values.length
        ? 0
        : null,

      nodes: makeNodes(values),

      newNode: {
        id: "new-node",
        value: newValue,
        status: "new",
      },
    },
  });

  if (values.length === 0) {
    steps.push({
      lineByLanguage: {
        c: 4,
        cpp: 4,
        java: 4,
        python: 4,
      },

      title: "Empty list",

      explanation:
        "The list is empty, so the new node directly becomes HEAD.",

      visual: {
        headIndex: 0,

        nodes: [
          {
            id: "new-node",
            value: newValue,
            status: "new",
          },
        ],
      },
    });
  } else {
    for (
      let index = 0;
      index < values.length;
      index++
    ) {
      steps.push({
        lineByLanguage: {
          c: 7,
          cpp: 7,
          java: 7,
          python: 7,
        },

        title: `Visit node ${values[index]}`,

        explanation:
          index === values.length - 1
            ? `${values[index]} is the last node because its next pointer is NULL.`
            : `Move the traversal pointer through node ${values[index]}.`,

        visual: {
          headIndex: 0,

          nodes: makeNodes(
            values,
            index
          ),

          newNode: {
            id: "new-node",
            value: newValue,
            status: "new",
          },
        },
      });
    }

    steps.push({
      lineByLanguage: {
        c: 10,
        cpp: 10,
        java: 10,
        python: 10,
      },

      title: "Connect the last node",

      explanation:
        `Change the last node's next pointer so that it points to the new node containing ${newValue}.`,

      visual: {
        headIndex: 0,

        nodes: makeNodes([
          ...values,
          newValue,
        ], values.length),
      },
    });
  }

  return {
    id: "linked-list-insert-end",

    title: "Insert at End",

    category: "Singly Linked List",

    timeComplexity:
      values.length > 0
        ? "O(n)"
        : "O(1)",

    spaceComplexity: "O(1)",

    code: {
      c: [
        "void insertAtEnd(struct Node** head, int value) {",
        "    struct Node* newNode = malloc(sizeof(struct Node));",
        "    newNode->data = value;",
        "    newNode->next = NULL;",
        "    if (*head == NULL) {",
        "        *head = newNode; return;",
        "    }",
        "    struct Node* temp = *head;",
        "    while (temp->next != NULL)",
        "        temp = temp->next;",
        "    temp->next = newNode;",
        "}",
      ],

      cpp: [
        "void insertAtEnd(Node*& head, int value) {",
        "    Node* newNode = new Node();",
        "    newNode->data = value;",
        "    newNode->next = nullptr;",
        "    if (head == nullptr) {",
        "        head = newNode; return;",
        "    }",
        "    Node* temp = head;",
        "    while (temp->next != nullptr)",
        "        temp = temp->next;",
        "    temp->next = newNode;",
        "}",
      ],

      java: [
        "void insertAtEnd(int value) {",
        "    Node newNode = new Node(value);",
        "    newNode.next = null;",
        "    if (head == null) {",
        "        head = newNode; return;",
        "    }",
        "    Node temp = head;",
        "    while (temp.next != null)",
        "        temp = temp.next;",
        "    temp.next = newNode;",
        "}",
      ],

      python: [
        "def insert_at_end(self, value):",
        "    new_node = Node(value)",
        "    new_node.next = None",
        "    if self.head is None:",
        "        self.head = new_node",
        "        return",
        "    temp = self.head",
        "    while temp.next is not None:",
        "        temp = temp.next",
        "    temp.next = new_node",
      ],
    },

    steps,
  };
}

/* =========================================================
   INSERT AT POSITION
   Position is ZERO-BASED.
========================================================= */

export function createInsertPositionLesson(
  values: number[],
  newValue: number,
  position: number
): AlgorithmLesson {
  const safePosition = Math.max(
    0,
    Math.min(position, values.length)
  );

  if (safePosition === 0) {
    const lesson =
      createInsertBeginningLesson(
        values,
        newValue
      );

    return {
      ...lesson,
      id: "linked-list-insert-position",
      title: `Insert at Position ${safePosition}`,
    };
  }

  if (safePosition === values.length) {
    const lesson =
      createInsertEndLesson(
        values,
        newValue
      );

    return {
      ...lesson,
      id: "linked-list-insert-position",
      title: `Insert at Position ${safePosition}`,
    };
  }

  const steps: AlgorithmLesson["steps"] =
    [];

  steps.push({
    lineByLanguage: {
      c: 1,
      cpp: 1,
      java: 1,
      python: 1,
    },

    title: "Initial linked list",

    explanation:
      `We want to insert ${newValue} at index ${safePosition}.`,

    visual: {
      headIndex: 0,
      nodes: makeNodes(values),
    },
  });

  steps.push({
    lineByLanguage: {
      c: 2,
      cpp: 2,
      java: 2,
      python: 2,
    },

    title: "Create the new node",

    explanation:
      `Create a new node containing ${newValue}.`,

    visual: {
      headIndex: 0,

      nodes: makeNodes(values),

      newNode: {
        id: "new-node",
        value: newValue,
        status: "new",
      },
    },
  });

  for (
    let index = 0;
    index < safePosition;
    index++
  ) {
    steps.push({
      lineByLanguage: {
        c: 7,
        cpp: 7,
        java: 7,
        python: 7,
      },

      title: `Traverse to index ${index}`,

      explanation:
        index === safePosition - 1
          ? `Stop at ${values[index]}. This is the node immediately before the insertion position.`
          : `Move through node ${values[index]}.`,

      visual: {
        headIndex: 0,

        nodes: makeNodes(
          values,
          index
        ),

        newNode: {
          id: "new-node",
          value: newValue,
          status: "new",
        },
      },
    });
  }

  steps.push({
    lineByLanguage: {
      c: 9,
      cpp: 9,
      java: 9,
      python: 9,
    },

    title: "Connect new node forward",

    explanation:
      `The new node first points to the node currently at index ${safePosition}.`,

    visual: {
      headIndex: 0,

      nodes: makeNodes(values),

      newNode: {
        id: "new-node",
        value: newValue,
        status: "active",
      },

      newNodePointsTo:
        safePosition,
    },
  });

  const finalValues = [
    ...values.slice(
      0,
      safePosition
    ),

    newValue,

    ...values.slice(
      safePosition
    ),
  ];

  steps.push({
    lineByLanguage: {
      c: 10,
      cpp: 10,
      java: 10,
      python: 10,
    },

    title: "Connect previous node",

    explanation:
      `The previous node now points to ${newValue}. The insertion is complete.`,

    visual: {
      headIndex: 0,

      nodes: makeNodes(
        finalValues,
        safePosition
      ),
    },
  });

  return {
    id: "linked-list-insert-position",

    title:
      `Insert at Position ${safePosition}`,

    category:
      "Singly Linked List",

    timeComplexity: "O(n)",

    spaceComplexity: "O(1)",

    code: {
      c: [
        "void insertAtPosition(struct Node** head, int value, int pos) {",
        "    struct Node* newNode = malloc(sizeof(struct Node));",
        "    newNode->data = value;",
        "    if (pos == 0) {",
        "        newNode->next = *head;",
        "        *head = newNode; return;",
        "    }",
        "    struct Node* temp = *head;",
        "    for (int i = 0; i < pos - 1; i++) temp = temp->next;",
        "    newNode->next = temp->next;",
        "    temp->next = newNode;",
        "}",
      ],

      cpp: [
        "void insertAtPosition(Node*& head, int value, int pos) {",
        "    Node* newNode = new Node();",
        "    newNode->data = value;",
        "    if (pos == 0) {",
        "        newNode->next = head;",
        "        head = newNode; return;",
        "    }",
        "    Node* temp = head;",
        "    for (int i = 0; i < pos - 1; i++) temp = temp->next;",
        "    newNode->next = temp->next;",
        "    temp->next = newNode;",
        "}",
      ],

      java: [
        "void insertAtPosition(int value, int pos) {",
        "    Node newNode = new Node(value);",
        "    if (pos == 0) {",
        "        newNode.next = head;",
        "        head = newNode; return;",
        "    }",
        "    Node temp = head;",
        "    for (int i = 0; i < pos - 1; i++) temp = temp.next;",
        "    newNode.next = temp.next;",
        "    temp.next = newNode;",
        "}",
      ],

      python: [
        "def insert_at_position(self, value, pos):",
        "    new_node = Node(value)",
        "    if pos == 0:",
        "        new_node.next = self.head",
        "        self.head = new_node",
        "        return",
        "    temp = self.head",
        "    for _ in range(pos - 1):",
        "        temp = temp.next",
        "    new_node.next = temp.next",
        "    temp.next = new_node",
      ],
    },

    steps,
  };
}
/* =========================================================
   REVERSE LINKED LIST
========================================================= */

export function createReverseLesson(
  values: number[]
): AlgorithmLesson {
  const steps: AlgorithmLesson["steps"] = [];

  /* -------------------------------------------------------
     STEP 1 — INITIAL LIST
  ------------------------------------------------------- */

  steps.push({
    lineByLanguage: {
      c: 1,
      cpp: 1,
      java: 1,
      python: 1,
    },

    title: "Start with the original linked list",

    explanation:
      "We want to reverse the direction of every next pointer so that the last node eventually becomes HEAD.",

    visual: {
      headIndex: values.length > 0 ? 0 : null,

      nodes: makeNodes(values),
    },
  });

  /* -------------------------------------------------------
     STEP 2 — INITIALIZE POINTERS
  ------------------------------------------------------- */

  steps.push({
    lineByLanguage: {
      c: 2,
      cpp: 2,
      java: 2,
      python: 2,
    },

    title: "Initialize prev",

    explanation:
      "prev starts as NULL. As we reverse the list, prev will represent the already-reversed part of the linked list.",

    visual: {
      headIndex: values.length > 0 ? 0 : null,

      nodes: makeNodes(values),
    },
  });

  if (values.length > 0) {
    steps.push({
      lineByLanguage: {
        c: 3,
        cpp: 3,
        java: 3,
        python: 3,
      },

      title: "Set current to HEAD",

      explanation:
        `current starts at the first node, ${values[0]}. We will move current through the entire list.`,

      visual: {
        headIndex: 0,

        nodes: makeNodes(values, 0),
      },
    });
  }

  /* -------------------------------------------------------
     PROCESS EVERY NODE
  ------------------------------------------------------- */

  for (
    let index = 0;
    index < values.length;
    index++
  ) {
    const currentValue = values[index];

    const nextValue =
      index + 1 < values.length
        ? values[index + 1]
        : null;

    /* SAVE NEXT */

    steps.push({
      lineByLanguage: {
        c: 5,
        cpp: 5,
        java: 5,
        python: 5,
      },

      title: `Save the next node after ${currentValue}`,

      explanation:
        nextValue !== null
          ? `Before changing the pointer of ${currentValue}, save ${nextValue} in a temporary next pointer. Otherwise we would lose access to the rest of the list.`
          : `${currentValue} is the last node, so the saved next pointer becomes NULL.`,

      visual: {
        headIndex: 0,

        nodes: values.map(
          (value, nodeIndex) => ({
            id: `node-${nodeIndex}-${value}`,
            value,

            status:
              nodeIndex === index
                ? "active"
                : nodeIndex < index
                ? "visited"
                : "normal",
          })
        ),
      },
    });

    /* REVERSE POINTER */

    steps.push({
      lineByLanguage: {
        c: 6,
        cpp: 6,
        java: 6,
        python: 6,
      },

      title: `Reverse the pointer of ${currentValue}`,

      explanation:
        index === 0
          ? `${currentValue} was originally pointing forward. Its next pointer is changed to NULL because it will become the final node of the reversed list.`
          : `Change ${currentValue}'s next pointer so that it points backward to ${values[index - 1]}.`,

      visual: {
        headIndex: 0,

        nodes: values.map(
          (value, nodeIndex) => ({
            id: `node-${nodeIndex}-${value}`,
            value,

            status:
              nodeIndex === index
                ? "active"
                : nodeIndex < index
                ? "visited"
                : "normal",
          })
        ),
      },
    });

    /* MOVE PREV */

    steps.push({
      lineByLanguage: {
        c: 7,
        cpp: 7,
        java: 7,
        python: 7,
      },

      title: `Move prev to ${currentValue}`,

      explanation:
        `prev now points to ${currentValue}. This node becomes the beginning of the reversed portion of the list.`,

      visual: {
        headIndex: 0,

        nodes: values.map(
          (value, nodeIndex) => ({
            id: `node-${nodeIndex}-${value}`,
            value,

            status:
              nodeIndex <= index
                ? "visited"
                : "normal",
          })
        ),
      },
    });

    /* MOVE CURRENT */

    steps.push({
      lineByLanguage: {
        c: 8,
        cpp: 8,
        java: 8,
        python: 8,
      },

      title:
        nextValue !== null
          ? `Move current to ${nextValue}`
          : "Move current to NULL",

      explanation:
        nextValue !== null
          ? `current moves forward to the saved node ${nextValue}. The algorithm can now repeat for that node.`
          : "There are no more nodes left to process, so current becomes NULL and the loop finishes.",

      visual: {
        headIndex: 0,

        nodes: values.map(
          (value, nodeIndex) => ({
            id: `node-${nodeIndex}-${value}`,
            value,

            status:
              nodeIndex === index + 1
                ? "active"
                : nodeIndex <= index
                ? "visited"
                : "normal",
          })
        ),
      },
    });
  }

  /* -------------------------------------------------------
     FINAL STEP
  ------------------------------------------------------- */

  steps.push({
    lineByLanguage: {
      c: 10,
      cpp: 10,
      java: 10,
      python: 9,
    },

    title: "Move HEAD to the last processed node",

    explanation:
      values.length > 0
        ? `prev is now pointing to ${values[values.length - 1]}. HEAD is updated to prev, completing the reversal.`
        : "The list is empty, so HEAD remains NULL.",

    visual: {
      headIndex:
        values.length > 0 ? 0 : null,

      nodes: makeNodes(
        [...values].reverse()
      ),
    },
  });

  /* -------------------------------------------------------
     LESSON
  ------------------------------------------------------- */

  return {
    id: "linked-list-reverse",

    title: "Reverse Linked List",

    category: "Singly Linked List",

    timeComplexity: "O(n)",

    spaceComplexity: "O(1)",

    code: {
      c: [
        "void reverse(struct Node** head) {",
        "    struct Node* prev = NULL;",
        "    struct Node* current = *head;",
        "    while (current != NULL) {",
        "        struct Node* next = current->next;",
        "        current->next = prev;",
        "        prev = current;",
        "        current = next;",
        "    }",
        "    *head = prev;",
        "}",
      ],

      cpp: [
        "void reverse(Node*& head) {",
        "    Node* prev = nullptr;",
        "    Node* current = head;",
        "    while (current != nullptr) {",
        "        Node* next = current->next;",
        "        current->next = prev;",
        "        prev = current;",
        "        current = next;",
        "    }",
        "    head = prev;",
        "}",
      ],

      java: [
        "void reverse() {",
        "    Node prev = null;",
        "    Node current = head;",
        "    while (current != null) {",
        "        Node next = current.next;",
        "        current.next = prev;",
        "        prev = current;",
        "        current = next;",
        "    }",
        "    head = prev;",
        "}",
      ],

      python: [
        "def reverse(self):",
        "    prev = None",
        "    current = self.head",
        "    while current is not None:",
        "        next_node = current.next",
        "        current.next = prev",
        "        prev = current",
        "        current = next_node",
        "    self.head = prev",
      ],
    },

    steps,
  };
}