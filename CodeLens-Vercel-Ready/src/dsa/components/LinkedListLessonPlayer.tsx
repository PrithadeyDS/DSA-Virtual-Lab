import { useEffect, useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import type {
  AlgorithmLesson,
  DsaLanguage,
} from "../types";

/* =========================================================
   TYPES
========================================================= */

type Props = {
  lesson: AlgorithmLesson;
};

const LANGUAGE_NAMES: Record<DsaLanguage, string> = {
  c: "C",
  cpp: "C++",
  java: "Java",
  python: "Python",
};

/* =========================================================
   COMPONENT
========================================================= */

export function LinkedListLessonPlayer({
  lesson,
}: Props) {
  const [language, setLanguage] =
    useState<DsaLanguage>("c");

  const [stepIndex, setStepIndex] =
    useState(0);

  const [playing, setPlaying] =
    useState(false);

  /* ---------------------------------------------------------
     CURRENT STEP
  --------------------------------------------------------- */

  const currentStep =
    lesson.steps[stepIndex];

  const activeLine =
    currentStep?.lineByLanguage[
      language
    ];

  const visual =
    currentStep?.visual;

  /*
   * Used when the visual step says:
   * newNode -> some existing node
   */
  const pointerTarget =
    visual &&
    typeof visual.newNodePointsTo ===
      "number"
      ? visual.nodes[
          visual.newNodePointsTo
        ]
      : undefined;

  /* ---------------------------------------------------------
     RESET WHEN LESSON CHANGES
  --------------------------------------------------------- */

  useEffect(() => {
    setPlaying(false);
    setStepIndex(0);
  }, [lesson]);

  /* ---------------------------------------------------------
     AUTO PLAY
  --------------------------------------------------------- */

  useEffect(() => {
    if (!playing) return;

    const timer =
      window.setInterval(() => {
        setStepIndex((current) => {
          if (
            current >=
            lesson.steps.length - 1
          ) {
            setPlaying(false);

            return current;
          }

          return current + 1;
        });
      }, 1800);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    playing,
    lesson.steps.length,
  ]);

  /* ---------------------------------------------------------
     CONTROLS
  --------------------------------------------------------- */

  function reset() {
    setPlaying(false);
    setStepIndex(0);
  }

  function previousStep() {
    setPlaying(false);

    setStepIndex((current) =>
      Math.max(0, current - 1)
    );
  }

  function nextStep() {
    setPlaying(false);

    setStepIndex((current) =>
      Math.min(
        lesson.steps.length - 1,
        current + 1
      )
    );
  }

  function selectLanguage(
    newLanguage: DsaLanguage
  ) {
    setLanguage(newLanguage);

    reset();
  }

  /* ---------------------------------------------------------
     SAFETY
  --------------------------------------------------------- */

  if (!currentStep || !visual) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        No visualization steps were
        found for this lesson.
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="w-full">

      {/* =====================================================
          LESSON HEADER
      ===================================================== */}

      <div className="mb-5">

        <div className="mono text-[10px] uppercase tracking-[0.16em] text-[#839f80]">
          {lesson.category}
        </div>

        <h3 className="mt-1 text-xl font-extrabold text-[#3a6340]">
          {lesson.title}
        </h3>

        <p className="mt-1 text-xs text-[#998e83]">
          Follow the source code line by
          line and watch the pointers
          change visually.
        </p>

      </div>


      {/* =====================================================
          LANGUAGE SELECTOR
      ===================================================== */}

      <div className="mb-5 flex flex-wrap gap-2">

        {(
          [
            "c",
            "cpp",
            "java",
            "python",
          ] as DsaLanguage[]
        ).map((item) => {

          const selected =
            language === item;

          return (
            <button
              key={item}
              type="button"

              onClick={() =>
                selectLanguage(item)
              }

              className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${
                selected
                  ? "border-[#7fac86] bg-[#d4e5d4] text-[#365f3c]"
                  : "border-[#d0e1d0] bg-[#fbf6ea] text-[#988e83] hover:border-[#9fc3a2] hover:text-[#4f7654]"
              }`}
            >
              {LANGUAGE_NAMES[item]}
            </button>
          );
        })}

      </div>


      {/* =====================================================
          CODE + VISUALIZATION
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-2">

        {/* =================================================
            CODE PANEL
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-[#4d6350] bg-[#243027] shadow-sm">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

            <div className="flex items-center gap-2">

              <span className="size-2 rounded-full bg-[#8db78d]" />

              <span className="mono text-[10px] font-bold uppercase tracking-wider text-[#bfd3bf]">
                {
                  LANGUAGE_NAMES[
                    language
                  ]
                }{" "}
                source code
              </span>

            </div>


            <span className="mono text-[9px] text-[#708372]">
              line {activeLine ?? "-"}
            </span>

          </div>


          {/* CODE */}

          <div className="max-h-[420px] overflow-auto py-3">

            {lesson.code[
              language
            ].map(
              (
                codeLine,
                index
              ) => {

                const lineNumber =
                  index + 1;

                const active =
                  lineNumber ===
                  activeLine;

                return (
                  <div
                    key={
                      lineNumber
                    }

                    className={`flex min-w-max border-l-[3px] px-4 py-1.5 font-mono text-[11px] leading-5 transition-all duration-300 ${
                      active
                        ? "border-[#9bc49a] bg-[#7fa47e]/20 text-white"
                        : "border-transparent text-[#b9cbb9]"
                    }`}
                  >

                    {/* LINE NUMBER */}

                    <span
                      className={`mr-5 w-5 select-none text-right ${
                        active
                          ? "text-[#a8cca7]"
                          : "text-[#647468]"
                      }`}
                    >
                      {
                        lineNumber
                      }
                    </span>


                    {/* SOURCE CODE */}

                    <code>
                      {codeLine ||
                        " "}
                    </code>

                  </div>
                );
              }
            )}

          </div>

        </div>


        {/* =================================================
            VISUAL EXECUTION
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-[#c8dfcb] bg-[#fffaf0]">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-[#dbe8d9] px-4 py-3">

            <span className="mono text-[10px] font-bold uppercase tracking-wider text-[#628068]">
              Visual execution
            </span>

            <span className="rounded-md bg-[#edf5e9] px-2 py-1 mono text-[9px] text-[#66856a]">
              step{" "}
              {stepIndex + 1}
            </span>

          </div>


          {/* VISUAL AREA */}

          <div className="min-h-[350px] p-5">


            {/* =============================================
                SEPARATE NEW NODE
            ============================================= */}

            {visual.newNode && (
              <div className="mb-16">

                <div className="mb-2 mono text-[10px] font-bold text-[#769275]">
                  newNode
                </div>


                <div className="flex flex-wrap items-center gap-2">

                  {/* NEW NODE BOX */}

                  <div className="relative grid h-16 w-24 shrink-0 grid-cols-[1fr_28px] overflow-hidden rounded-xl border-2 border-[#7ca27b] bg-[#dcebd9] shadow-sm">

                    {/* DATA */}

                    <div className="grid place-items-center font-mono text-sm font-extrabold text-[#375f3e]">
                      {
                        visual
                          .newNode
                          .value
                      }
                    </div>


                    {/* POINTER CELL */}

                    <div className="grid place-items-center border-l border-[#a9c9aa] bg-[#cce0c9] text-[10px] text-[#608365]">
                      ●
                    </div>

                  </div>


                  {/* POINTER FROM NEW NODE */}

                  {pointerTarget && (
                    <div className="flex items-center">

                      <div className="mx-2 h-px w-12 border-t-2 border-dashed border-[#7fa985]" />

                      <ChevronRight
                        size={18}
                        className="-ml-5 text-[#6e9875]"
                      />

                      <span className="ml-3 whitespace-nowrap mono text-[10px] font-bold text-[#52745a]">
                        points to{" "}
                        {
                          pointerTarget.value
                        }
                      </span>

                    </div>
                  )}


                  {/* NULL POINTER */}

                  {visual.newNodePointsTo ===
                    null && (
                    <span className="ml-2 mono text-[10px] font-bold text-[#93897e]">
                      → NULL
                    </span>
                  )}

                </div>

              </div>
            )}


            {/* =============================================
                LINKED LIST LABEL
            ============================================= */}

            <div className="mb-3 mono text-[10px] font-bold uppercase tracking-wider text-[#9b9085]">
              Linked list
            </div>


            {/* =============================================
                LINKED LIST
            ============================================= */}

            {visual.nodes.length ===
            0 ? (

              /* EMPTY LIST */

              <div className="grid min-h-[130px] place-items-center rounded-xl border border-dashed border-[#ccdccc] bg-[#f6f8ef]">

                <div className="text-center">

                  <div className="mono text-xs font-bold text-[#79937b]">
                    HEAD → NULL
                  </div>

                  <div className="mt-2 text-[10px] text-[#a0968c]">
                    The linked list is
                    empty.
                  </div>

                </div>

              </div>

            ) : (

              <div className="flex min-h-[130px] items-center overflow-x-auto pb-5 pt-8">

                {visual.nodes.map(
                  (
                    node,
                    index
                  ) => {

                    const highlighted =
                      node.status ===
                        "active" ||
                      node.status ===
                        "new" ||
                      node.status ===
                        "visited";

                    const deleted =
                      node.status ===
                      "deleted";

                    return (
                      <div
                        key={
                          node.id
                        }

                        className="flex items-center"
                      >

                        {/* NODE */}

                        <div className="relative">

                          {/* HEAD */}

                          {visual.headIndex ===
                            index && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">

                              <div className="mono text-[10px] font-extrabold text-[#426c49]">
                                HEAD
                              </div>

                              <div className="text-[#69936e]">
                                ↓
                              </div>

                            </div>
                          )}


                          {/* NODE BOX */}

                          <div
                            className={`grid h-16 w-24 shrink-0 grid-cols-[1fr_28px] overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-500 ${
                              deleted
                                ? "scale-95 border-red-300 bg-red-50 opacity-50"
                                : highlighted
                                ? "scale-[1.04] border-[#709b72] bg-[#d4e7d2]"
                                : "border-[#a9c9aa] bg-[#eef5ea]"
                            }`}
                          >

                            {/* DATA */}

                            <div className="grid place-items-center font-mono text-sm font-extrabold text-[#3d6744]">
                              {
                                node.value
                              }
                            </div>


                            {/* NEXT POINTER */}

                            <div className="grid place-items-center border-l border-[#b9d1b9] bg-[#e1eddd] text-[10px] text-[#759377]">
                              ●
                            </div>

                          </div>


                          {/* INDEX */}

                          <div className="mt-2 text-center mono text-[9px] text-[#a09589]">
                            index{" "}
                            {index}
                          </div>

                        </div>


                        {/* POINTER BETWEEN NODES */}

                        {index <
                          visual.nodes
                            .length -
                            1 && (
                          <div className="mb-5 flex w-14 items-center">

                            <div className="h-px flex-1 border-t-2 border-dashed border-[#92b696]" />

                            <ChevronRight
                              size={
                                17
                              }
                              className="-ml-1 text-[#779f7c]"
                            />

                          </div>
                        )}

                      </div>
                    );
                  }
                )}


                {/* NULL */}

                <div className="mb-5 ml-3 flex items-center gap-2">

                  <div className="w-6 border-t-2 border-dashed border-[#b7c8b5]" />

                  <span className="mono text-[10px] font-bold text-[#9c9187]">
                    NULL
                  </span>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          STEP EXPLANATION
      ===================================================== */}

      <div className="mt-5 rounded-xl border border-[#c7ddc7] bg-[#eef5ea] p-5">

        <div className="mb-2 flex items-center gap-2">

          {/* STEP NUMBER */}

          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#d4e5d4] mono text-[10px] font-bold text-[#4a7350]">
            {stepIndex + 1}
          </span>


          {/* STEP TITLE */}

          <h4 className="text-sm font-extrabold text-[#3d6744]">
            {
              currentStep.title
            }
          </h4>

        </div>


        {/* STEP DESCRIPTION */}

        <p className="text-sm leading-6 text-[#56775b]">
          {
            currentStep.explanation
          }
        </p>

      </div>


      {/* =====================================================
          STEP PROGRESS
      ===================================================== */}

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e1eadc]">

        <div
          className="h-full rounded-full bg-[#7da17d] transition-all duration-500"

          style={{
            width: `${
              ((stepIndex + 1) /
                lesson.steps
                  .length) *
              100
            }%`,
          }}
        />

      </div>


      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div className="mt-4 flex flex-wrap items-center gap-2">

        {/* PREVIOUS */}

        <button
          type="button"

          onClick={
            previousStep
          }

          disabled={
            stepIndex === 0
          }

          className="flex items-center gap-1 rounded-lg border border-[#c8dfcb] bg-[#fffaf0] px-3 py-2 text-xs font-bold text-[#55765a] transition hover:bg-[#edf5e9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft
            size={14}
          />

          Previous
        </button>


        {/* AUTO PLAY */}

        <button
          type="button"

          onClick={() =>
            setPlaying(
              (current) =>
                !current
            )
          }

          className="flex items-center gap-2 rounded-lg bg-[#668b68] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#557a5b]"
        >
          {playing ? (
            <>
              <Pause
                size={14}
              />
              Pause
            </>
          ) : (
            <>
              <Play
                size={14}
              />
              Auto play
            </>
          )}
        </button>


        {/* NEXT */}

        <button
          type="button"

          onClick={nextStep}

          disabled={
            stepIndex ===
            lesson.steps.length -
              1
          }

          className="flex items-center gap-1 rounded-lg border border-[#c8dfcb] bg-[#fffaf0] px-3 py-2 text-xs font-bold text-[#55765a] transition hover:bg-[#edf5e9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next

          <ChevronRight
            size={14}
          />
        </button>


        {/* RESET */}

        <button
          type="button"

          onClick={reset}

          className="ml-1 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-[#988d83] transition hover:bg-[#f4eee3]"
        >
          <RotateCcw
            size={13}
          />

          Reset
        </button>


        {/* STEP COUNT */}

        <div className="ml-auto mono text-[10px] text-[#9c9187]">
          Step{" "}
          {stepIndex + 1} of{" "}
          {
            lesson.steps
              .length
          }
        </div>

      </div>


      {/* =====================================================
          COMPLEXITY CARDS
      ===================================================== */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">

        {/* TIME */}

        <div className="rounded-lg border border-[#d0e2cf] bg-[#f7f9f2] p-3">

          <div className="mono text-[9px] uppercase tracking-wider text-[#9a9085]">
            Time complexity
          </div>

          <div className="mt-1 font-mono text-lg font-extrabold text-[#47714d]">
            {
              lesson.timeComplexity
            }
          </div>

        </div>


        {/* SPACE */}

        <div className="rounded-lg border border-[#d0e2cf] bg-[#f7f9f2] p-3">

          <div className="mono text-[9px] uppercase tracking-wider text-[#9a9085]">
            Auxiliary space
          </div>

          <div className="mt-1 font-mono text-lg font-extrabold text-[#47714d]">
            {
              lesson.spaceComplexity
            }
          </div>

        </div>

      </div>

    </div>
  );
}