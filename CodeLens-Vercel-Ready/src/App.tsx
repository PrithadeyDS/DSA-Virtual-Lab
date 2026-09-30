import { LinkedListLessonPlayer } from "@/dsa/components/LinkedListLessonPlayer";
import {
  createInsertBeginningLesson,
  createInsertEndLesson,
  createInsertPositionLesson,
  createReverseLesson,
} from "@/dsa/lessons/linkedList";
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalyzeCode } from '@/api-client';
import { CodeFolderIcon } from '@/components/code-folder-icon';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  AlertTriangle, ArrowDown, ArrowRight, ArrowUp, BookOpen, Check, ChevronDown, ChevronRight,
  CircleCheck, CircleDot, Clock3, Code2, Database, ExternalLink, Eye, GitBranch, Github, Hash,
  Info, Layers3, Lightbulb, List, LockKeyhole, Menu, Minus, Network, PanelLeft, Pause, Play,
  Plus, RotateCcw, Route, Search, SlidersHorizontal, Sparkles, StepForward, Terminal, Trash2,
  TreePine, Workflow, X, type LucideIcon,
} from 'lucide-react';
import { Link, Route as WRoute, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const starterCode = `def find_pair(numbers, target):
    for i in range(len(numbers)):
        for j in range(len(numbers)):
            if numbers[i] + numbers[j] == target:
                return [i, j]
    return None`;

const javaStarter = `public class Report {
    public String load(String path) {
        try {
            BufferedReader reader = new BufferedReader(new FileReader(path));
            String line = reader.readLine();
            if (line == "done") {
                System.out.println("finished");
            }
            return line;
        } catch (Exception e) {
            return null;
        }
    }
}`;

const cStarter = `#include <stdio.h>
#include <stdlib.h>

int sumRange(int values[], int count) {
    int *total;

    for (int i = 0; i <= count; i++) {
        *total += values[i];
    }

    char name[16];
    gets(name);

    return *total;
}`;

const cppStarter = `#include <vector>

int sumRange(std::vector<int> values, int count) {
    int* total;

    for (int i = 0; i <= count; i++) {
        *total += values[i];
    }

    Buffer* buffer = new Buffer(1024);

    return *total;
}`;

type Language = 'python' | 'java' | 'c' | 'cpp';

const languages: {
  id: Language;
  label: string;
  badge: string;
  file: string;
  runtime: string;
  starter: string;
}[] = [
  {
    id: 'python',
    label: 'Python',
    badge: 'py',
    file: 'main.py',
    runtime: 'Python 3.12',
    starter: starterCode,
  },
  {
    id: 'java',
    label: 'Java',
    badge: 'jv',
    file: 'Report.java',
    runtime: 'Java 21',
    starter: javaStarter,
  },
  {
    id: 'c',
    label: 'C',
    badge: 'c',
    file: 'main.c',
    runtime: 'C17',
    starter: cStarter,
  },
  {
    id: 'cpp',
    label: 'C++',
    badge: 'cpp',
    file: 'main.cpp',
    runtime: 'C++20',
    starter: cppStarter,
  },
];

type Issue = { type: string; message: string; hints: string[]; solution: string; explanation: string };
type Review = { issue_count: number; issues: Issue[] };

function Logo() {
  return <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
    <span className="grid size-8 place-items-center rounded-lg border border-[#9cc5a2] bg-[#d4e6d7] text-[#416f47]">
      <CodeFolderIcon size={19} aria-hidden="true" />
    </span>
    <span className="text-sm font-extrabold tracking-tight text-[#385f3d]">Code<span className="text-[#6f8f63]">Lens</span></span>
  </Link>;
}

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Review', icon: Code2 },
  { href: '/dsa', label: 'Learn', icon: Network },
  { href: '/features', label: 'Features', icon: Sparkles },
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  return <div className="app-shell noise">
    <header className="sticky top-0 z-30 border-b border-[#d2e5d5] bg-[#fdf8ee]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const active = location === item.href;
              const Icon = item.icon;
              return <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${active ? 'bg-[#d6e7d8] text-[#3c6541]' : 'text-[#b1a497] hover:bg-[#f1f6ec] hover:text-[#437249]'}`}>
                <Icon size={15} /><span>{item.label}</span>
              </Link>;
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-[11px] text-[#b6aa9e] sm:flex"><span className="pulse-dot size-1.5 rounded-full bg-[#6f9a72]" /> API connected</span>
          <button className="btn grid size-9 place-items-center rounded-lg border border-[#cde2d0] text-[#55905d] hover:text-[#3e6a44] md:hidden" onClick={() => setMobileNav((v) => !v)} data-testid="button-toggle-navigation">
            {mobileNav ? <X size={17} /> : <Menu size={17} />}
          </button>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-lg border border-[#cde2d0] px-3 py-2 text-xs font-semibold text-[#7b6c5d] transition-colors hover:border-[#a0c7a5] hover:text-[#3a633f] sm:flex" data-testid="link-github"><Github size={14} /> GitHub</a>
          <Link href="/" className="hidden items-center gap-2 rounded-lg bg-[#7f9c73] px-3.5 py-2 text-xs font-bold text-[#4a3b2f] transition-colors hover:bg-[#8fae82] sm:flex" data-testid="link-analyze-code"><Sparkles size={13} /> Analyze code</Link>
        </div>
      </div>
      {mobileNav && <nav className="border-t border-[#d2e5d5] px-5 py-3 md:hidden">
        {navItems.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={() => setMobileNav(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#7b6c5d]" data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s/g, '-')}`}><Icon size={15} />{item.label}</Link>; })}
      </nav>}
    </header>
    <main>{children}</main>
    <footer className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 border-t border-[#d2e5d5] px-5 py-7 text-xs text-[#baaea3] sm:flex-row lg:px-8">
      <span>Built for the curious. No shortcuts.</span><span className="mono">codelens / v0.4.1</span>
    </footer>
  </div>;
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="mb-8 max-w-2xl"><div className="eyebrow mb-3">{eyebrow}</div><h1 className="display text-4xl font-extrabold text-[#385f3d] sm:text-5xl">{title}</h1>{copy && <p className="mt-4 text-base leading-7 text-[#827262]">{copy}</p>}</div>;
}

function Button({ children, onClick, variant = 'primary', disabled = false, testId, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'quiet' | 'danger'; disabled?: boolean; testId: string; type?: 'button' | 'submit' }) {
  const styles = {
    primary: 'bg-[#7f9c73] text-[#4a3b2f] hover:bg-[#8fae82]',
    ghost: 'border border-[#9cc5a2] bg-[#d3e5d5] text-[#3c6641] hover:bg-[#cae0cd]',
    quiet: 'border border-[#cfe3d1] text-[#7b6c5d] hover:border-[#9cc5a2] hover:text-[#3c6642]',
    danger: 'border border-[#dbbfc4] text-[#c07f8c] hover:bg-[#e8d6d9]',
  };
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`btn inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[12px] font-bold disabled:cursor-not-allowed disabled:opacity-45 ${styles[variant]}`}>{children}</button>;
}

function Home() {
  const [code, setCode] = useState(starterCode);
  const [review, setReview] = useState<Review | null>(null);
  const [openIssues, setOpenIssues] = useState<Record<number, number>>({});
  const [language, setLanguage] = useState<Language>('python');
  const activeLanguage = languages.find((item) => item.id === language) ?? languages[0];
  const analyze = useAnalyzeCode();
  const switchLanguage = (next: Language) => {
    setLanguage(next);
    setReview(null);
    setOpenIssues({});
    const isUntouched = languages.some((item) => item.starter === code) || !code.trim();
    if (isUntouched) setCode(languages.find((item) => item.id === next)?.starter ?? '');
  };
  const runReview = () => {
    setReview(null);
    setOpenIssues({});
    analyze.mutate({ data: { code, language } }, { onSuccess: (result) => setReview(result as Review) });
  };
  const count = code.length;
  const health = review ? Math.max(0, Math.round(100 - review.issue_count * 15)) : null;
  return <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 lg:px-8 lg:pt-20">
    <section className="reveal grid items-end gap-10 lg:grid-cols-[1fr_340px]">
      <div><div className="eyebrow mb-5 flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#6f8f63]" /> {activeLanguage.label} review studio</div>
        <h1 className="display max-w-3xl text-5xl font-extrabold text-[#385f3d] sm:text-7xl">Write better code.<br /><span className="text-[#6f8f63]">Understand why.</span></h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#847464]">CodeLens reviews your Python, Java, C and C++ code and teaches you how to improve it — one hint at a time.</p>
      </div>
      <div className="panel hidden p-5 lg:block"><div className="mb-4 flex items-center justify-between"><span className="eyebrow">Session signal</span><CircleCheck size={17} className="text-[#6f9a72]" /></div><div className="flex items-end justify-between"><span className="text-3xl font-extrabold text-[#385f3d]">{health ?? '—'}</span><span className="mono pb-1 text-[11px] text-[#b6aa9e]">health score</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#d2e5d5]"><div className="h-full rounded-full bg-[#6f8f63] transition-all" style={{ width: `${health ?? 4}%` }} /></div><p className="mt-3 text-xs leading-5 text-[#b3a79a]">A score appears after your first review. Your code stays in your session.</p></div>
    </section>
    <section className="reveal reveal-2 mt-12 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.7fr)]">
      <div className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#d0e4d3] bg-[#f4f8f0] px-4 py-3"><div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#e0a3ab]" /><span className="size-2 rounded-full bg-[#e6b48c]" /><span className="size-2 rounded-full bg-[#4e8455]" /><span className="ml-3 flex items-center gap-2 text-xs font-semibold text-[#786a5b]"><Terminal size={13} /> {activeLanguage.file}</span></div><div className="flex items-center gap-2"><div className="flex items-center gap-1 rounded-xl border border-[#dbe8d6] bg-[#f7fbf4] p-1" role="group" aria-label="Review language" data-testid="group-language">{languages.map((item) => <button key={item.id} type="button" onClick={() => switchLanguage(item.id)} aria-pressed={language === item.id} data-testid={`button-language-${item.id}`} className={`btn flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${language === item.id ? 'bg-[#8aa77c] text-[#fdf8ee]' : 'text-[#7b6d5e] hover:bg-[#eef4e9]'}`}><span aria-hidden="true" className="mono text-[9px] opacity-70">{item.badge}</span>{item.label}</button>)}</div><span className="mono hidden text-[10px] text-[#b9aea3] sm:inline">{activeLanguage.runtime}</span></div></div>
        <div className="flex min-h-[420px]"><div className="w-12 shrink-0 select-none border-r border-[#d4e6d6] bg-[#f6efe1] px-3 py-5 text-right font-mono text-[12px] leading-6 text-[#a2c8a7]">{code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div><textarea value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} className="code-editor min-h-[420px] w-full resize-none bg-[#fbf6ea] px-5 py-5 font-mono text-[13px] leading-6 text-[#406d46] outline-none" data-testid="input-python-code" aria-label={`${activeLanguage.label} code editor`} /></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d0e4d3] bg-[#f8f2e6] px-4 py-3"><span className="mono text-[11px] text-[#b7aba0]">{count.toLocaleString()} / 50,000 characters</span><div className="flex gap-2"><Button variant="quiet" onClick={() => setCode('')} testId="button-clear-code"><Trash2 size={13} /> Clear</Button><Button onClick={runReview} disabled={analyze.isPending || !code.trim()} testId="button-analyze-code">{analyze.isPending ? <><Clock3 size={13} /> Reviewing…</> : <><Sparkles size={13} /> Review code <ArrowRight size={14} /></>}</Button></div></div>
      </div>
      <aside className="panel flex min-h-[300px] flex-col p-5">
        <div className="flex items-center justify-between"><div><div className="eyebrow mb-2">Review output</div><h2 className="text-base font-bold text-[#3a6340]">Your thinking partner</h2></div><span className={`rounded-full border px-2 py-1 mono text-[10px] ${review ? 'border-[#9ccaab] text-[#6f9a72]' : 'border-[#cae0cd] text-[#b5a99d]'}`}>{review ? `${review.issue_count} signal${review.issue_count === 1 ? '' : 's'}` : 'waiting'}</span></div>
        <div className="mt-5 flex-1">{analyze.isPending ? <div className="space-y-3"><div className="h-12 animate-pulse rounded-lg bg-[#d5e6d7]" /><div className="h-20 animate-pulse rounded-lg bg-[#eef5ea]" /><div className="h-16 animate-pulse rounded-lg bg-[#eef5ea]" /></div> : analyze.isError ? <div className="rounded-lg border border-[#dbbec3] bg-[#dfeae0] p-4"><AlertTriangle size={17} className="mb-3 text-[#c07f8c]" /><p className="text-sm font-semibold text-[#75353f]">The review could not reach the studio.</p><p className="mt-2 text-xs leading-5 text-[#9d4755]">Check your connection and try again. Your code is still here.</p><Button variant="danger" onClick={runReview} testId="button-retry-analysis">Try again</Button></div> : review ? <IssueList review={review} openIssues={openIssues} setOpenIssues={setOpenIssues} /> : <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center"><div className="mb-4 grid size-11 place-items-center rounded-xl border border-[#c2dbc5] bg-[#d8e8da] text-[#497c50]"><Lightbulb size={20} /></div><p className="text-sm font-semibold text-[#477a4e]">No shortcuts. Just signals.</p><p className="mt-2 max-w-[220px] text-xs leading-5 text-[#b6aa9e]">Run a review to uncover the next useful question about your code.</p></div>}</div>
      </aside>
    </section>
    <div className="reveal reveal-3 mt-6 grid gap-4 sm:grid-cols-3"><MiniStat icon={LockKeyhole} label="Private by default" value="Session-only code" /><MiniStat icon={Lightbulb} label="Guided discovery" value="Hints, not spoilers" /><MiniStat icon={Workflow} label="Visual thinking" value="DSA lab included" /></div>
  </div>;
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="panel-soft flex items-center gap-3 p-4"><Icon size={16} className="text-[#4b7f52]" /><div><div className="text-xs text-[#b6aa9e]">{label}</div><div className="mt-1 text-sm font-semibold text-[#45764b]">{value}</div></div></div>;
}

function IssueList({ review, openIssues, setOpenIssues }: { review: Review; openIssues: Record<number, number>; setOpenIssues: (v: Record<number, number>) => void }) {
  if (!review.issues.length) return <div className="rounded-lg border border-[#a2cdb0] bg-[#dfebe3] p-4"><CircleCheck className="mb-3 text-[#6f9a72]" size={20} /><p className="text-sm font-bold text-[#3c6f4d]">No issues found.</p><p className="mt-1 text-xs leading-5 text-[#4d8f63]">The code is doing what it says. Keep asking why it works.</p></div>;
  return <div className="space-y-3">{review.issues.map((issue, index) => { const step = openIssues[index] ?? 0; const hasSolution = step >= 3; return <div key={`${issue.type}-${index}`} className="rounded-lg border border-[#cce1ce] bg-[#f4f8f0] p-4" data-testid={`card-issue-${index}`}><div className="flex items-start gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-md bg-[#d3e5d5] mono text-[10px] text-[#487a4e]">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><div className="eyebrow mb-1">{issue.type}</div><p className="text-sm leading-5 text-[#3e6943]">{issue.message}</p></div></div><div className="mt-4 space-y-2 pl-9">{hasSolution ? <><div className="rounded-md border border-[#c2ddcb] bg-[#e1ece5] p-3"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#6f9a72]"><Check size={13} /> Corrected approach</div><pre className="overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-[#417853]">{issue.solution}</pre></div><div className="rounded-md bg-[#f3f7ee] p-3 text-xs leading-5 text-[#4d8454]"><span className="font-bold text-[#427048]">Why it works. </span>{issue.explanation}</div></> : <><div className="rounded-md bg-[#f3f7ee] p-3 text-xs leading-5 text-[#4d8454]"><span className="font-bold text-[#427048]">Hint {step + 1}. </span>{issue.hints[step] ?? 'Look closely at the work repeated in the loop.'}</div><Button variant="ghost" onClick={() => setOpenIssues({ ...openIssues, [index]: step + 1 })} testId={`button-reveal-hint-${index}`}>{step === 2 ? 'Reveal corrected code' : 'Next hint'} <ChevronRight size={13} /></Button></>}</div></div>; })}</div>;
}

function DsaLab() {
  const [lab, setLab] = useState('linked-list');
  const labs = [
    { id: 'linked-list', label: 'Linked list', icon: List }, { id: 'stack', label: 'Stack', icon: Layers3 }, { id: 'queue', label: 'Queue', icon: ArrowRight }, { id: 'tree', label: 'Binary tree', icon: TreePine }, { id: 'search', label: 'Searching', icon: Search }, { id: 'sort', label: 'Sorting', icon: SlidersHorizontal }, { id: 'hash', label: 'Hash table', icon: Hash }, { id: 'heap', label: 'Heap', icon: Database }, { id: 'graph', label: 'Graph', icon: Route },
  ];
  return <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-12 lg:px-8 lg:pt-16"><div className="reveal flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><SectionTitle eyebrow="DSA Lab / 09 modules" title="Visualize. Understand." copy="Learn data structures by watching algorithms happen step by step. Change the state, watch the pointer move, and learn the cost of each decision." /><div className="panel-soft flex items-center gap-3 px-4 py-3"><span className="pulse-dot size-2 rounded-full bg-[#6f9a72]" /><div><div className="mono text-[10px] uppercase tracking-wider text-[#b3a79a]">Lab status</div><div className="mt-1 text-xs font-semibold text-[#407752]">Ready to explore</div></div></div></div>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-2 mobile-scroll" data-testid="lab-navigation">{labs.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setLab(item.id)} className={`btn flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${lab === item.id ? 'border-[#97c29d] bg-[#d1e4d4] text-[#3b6541]' : 'border-[#d2e4d4] text-[#b1a598] hover:text-[#45764b]'}`} data-testid={`button-lab-${item.id}`}><Icon size={14} />{item.label}</button>; })}</div>
    <div className="reveal reveal-2 mt-5">{lab === 'linked-list' && <LinkedListLab />}{lab === 'stack' && <StackLab />}{lab === 'queue' && <QueueLab />}{lab === 'tree' && <TreeLab />}{lab === 'search' && <SearchLab />}{lab === 'sort' && <SortLab />}{lab === 'hash' && <HashLab />}{lab === 'heap' && <HeapLab />}{lab === 'graph' && <GraphLab />}</div>
  </div>;
}

function LabFrame({ title, kicker, children, explanation }: { title: string; kicker: string; children: ReactNode; explanation: ReactNode }) {
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]"><section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d0e4d3] px-5 py-4"><div><div className="eyebrow mb-1">{kicker}</div><h2 className="text-lg font-extrabold text-[#3a6340]">{title}</h2></div><div className="flex gap-2"><span className="rounded-md border border-[#c8dfcb] bg-[#f4f8f0] px-2 py-1 mono text-[10px] text-[#b1a497]">interactive</span><span className="rounded-md border border-[#bfdbc9] bg-[#deeae2] px-2 py-1 mono text-[10px] text-[#47845b]">O(n)</span></div></div><div className="lab-grid min-h-[360px] p-5">{children}</div></section><aside className="panel h-fit p-5"><div className="mb-4 flex items-center gap-2 text-[#6f8f63]"><Lightbulb size={16} /><span className="eyebrow">Learn by doing</span></div>{explanation}</aside></div>;
}

function Controls({ children }: { children: ReactNode }) { return <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#cfe3d2] pt-4">{children}</div>; }
function LinkedListLab() {
  const [operation, setOperation] =
    useState<
      | "insertBeginning"
      | "insertEnd"
      | "insertPosition"
      | "reverse"
    >("insertBeginning");

  const [value, setValue] =
    useState("54");

  const [position, setPosition] =
    useState("2");

  const initialNodes = [
    12,
    28,
    41,
    63,
    87,
  ];

  const numericValue =
    Number(value) || 0;

  const numericPosition =
    Number(position) || 0;

  const lesson = useMemo(() => {
    switch (operation) {
      case "insertEnd":
        return createInsertEndLesson(
          initialNodes,
          numericValue
        );

      case "insertPosition":
        return createInsertPositionLesson(
          initialNodes,
          numericValue,
          numericPosition
        );
      
      case "reverse":
        return createReverseLesson(
          initialNodes
        );
  

      default:
        return createInsertBeginningLesson(
          initialNodes,
          numericValue
        );
    }
  }, [
    operation,
    numericValue,
    numericPosition,
  ]);

  return (
    <LabFrame
      title="Linked list"
      kicker="Code execution / pointers"

      explanation={
        <>
          <p className="text-sm leading-6 text-[#497c4f]">
            Learn linked-list operations by
            following real source code while
            watching each pointer change.
          </p>

          <div className="mt-5 rounded-lg border border-[#c8dfcb] bg-[#eef5ea] p-3">

            <div className="mono text-[9px] uppercase tracking-wider text-[#899989]">
              How it works
            </div>

            <p className="mt-2 text-xs leading-5 text-[#57775c]">
              Choose an operation, enter your
              value and position, then move
              through the algorithm one step
              at a time.
            </p>

          </div>
        </>
      }
    >

      {/* ================================================
          OPERATION CONTROLS
      ================================================= */}

      <div className="mb-6 rounded-xl border border-[#c8dfcb] bg-[#f7f8ee] p-4">

        <div className="flex flex-wrap items-end gap-3">

          {/* OPERATION */}

          <label>
            <span className="mb-1 block mono text-[9px] uppercase tracking-wider text-[#92897f]">
              Operation
            </span>

            <select
              value={operation}

              onChange={(event) =>
                setOperation(
                  event.target
                    .value as typeof operation
                )
              }

              className="rounded-lg border border-[#c5d9c5] bg-[#fffaf0] px-3 py-2 text-xs font-bold text-[#4e7354] outline-none"
            >
              <option value="insertBeginning">
                Insert at Beginning
              </option>

              <option value="insertEnd">
                Insert at End
              </option>

              <option value="insertPosition">
                Insert at Position
              </option>

              <option value="reverse">
                Reverse Linked List
             </option>
            </select>
          </label>


          {/* VALUE */}

          <label>
            <span className="mb-1 block mono text-[9px] uppercase tracking-wider text-[#92897f]">
              Value
            </span>

            <input
              type="number"

              value={value}

              onChange={(event) =>
                setValue(
                  event.target.value
                )
              }

              className="w-24 rounded-lg border border-[#c5d9c5] bg-[#fffaf0] px-3 py-2 font-mono text-xs text-[#4e7354] outline-none"
            />
          </label>


          {/* POSITION */}

          {operation ===
            "insertPosition" && (
            <label>
              <span className="mb-1 block mono text-[9px] uppercase tracking-wider text-[#92897f]">
                Position
              </span>

              <input
                type="number"
                min="0"
                max={
                  initialNodes.length
                }

                value={position}

                onChange={(event) =>
                  setPosition(
                    event.target.value
                  )
                }

                className="w-24 rounded-lg border border-[#c5d9c5] bg-[#fffaf0] px-3 py-2 font-mono text-xs text-[#4e7354] outline-none"
              />
            </label>
          )}


          {/* CURRENT LIST */}

          <div className="ml-auto">
            <span className="mb-1 block mono text-[9px] uppercase tracking-wider text-[#92897f]">
              Starting list
            </span>

            <div className="rounded-lg border border-[#d3e2d2] bg-[#eef5ea] px-3 py-2 font-mono text-xs text-[#658069]">
              12 → 28 → 41 → 63 → 87
            </div>
          </div>

        </div>

      </div>


      {/* ================================================
          PLAYER
      ================================================= */}

      <LinkedListLessonPlayer
        key={`${operation}-${numericValue}-${numericPosition}`}
        lesson={lesson}
      />

    </LabFrame>
  );
}

function StackLab() {
  const [items, setItems] = useState(['parse', 'compile', 'execute']); const [value, setValue] = useState('return');
  return <LabFrame title="Stack" kicker="LIFO / call frames" explanation={<><p className="text-sm leading-6 text-[#497c4f]">A stack is last-in, first-out. It is the mental model behind nested function calls and undo history.</p><div className="mt-5 rounded-lg border border-[#c8dfcb] bg-[#eef5ea] p-3 text-xs leading-5 text-[#538d5b]"><span className="text-[#6f8f63]">Top</span> is where every operation happens. Push and pop are constant time.</div></>}><div className="flex min-h-[250px] items-end justify-center gap-3"><div className="flex w-52 flex-col-reverse gap-2 rounded-b-xl border-x border-b border-[#a4caa9] bg-[#f4f8f0] p-3">{items.map((item, i) => <div key={`${item}-${i}`} className={`rounded-lg border px-4 py-3 text-center mono text-xs ${i === items.length - 1 ? 'border-[#95c19b] bg-[#cde2d0] text-[#3c6742]' : 'border-[#cce1ce] bg-[#eef5ea] text-[#528b59]'}`}>{item}</div>)}{!items.length && <div className="py-8 text-center mono text-xs text-[#b7aca0]">empty</div>}</div><div className="self-center mono text-[10px] text-[#99c39f]">top<br />↓</div></div><div className="mt-4 flex items-center justify-center gap-2"><input value={value} onChange={(e) => setValue(e.target.value)} className="w-28 rounded-lg border border-[#c8dfcb] bg-[#fbf6ea] px-3 py-2 mono text-xs text-[#46774d] outline-none" data-testid="input-stack-value" /><Button onClick={() => { if (value) setItems([...items, value]); }} testId="button-stack-push"><Plus size={13} /> Push</Button><Button variant="quiet" onClick={() => setItems(items.slice(0, -1))} testId="button-stack-pop"><Minus size={13} /> Pop</Button><Button variant="quiet" onClick={() => alert(items.at(-1) ? `Top: ${items.at(-1)}` : 'Stack is empty')} testId="button-stack-peek"><Eye size={13} /> Peek</Button><Button variant="quiet" onClick={() => setItems([])} testId="button-stack-clear">Clear</Button></div></LabFrame>;
}

function QueueLab() {
  const [items, setItems] = useState(['request-12', 'request-13', 'request-14']); const [value, setValue] = useState('request-15');
  return <LabFrame title="Queue" kicker="FIFO / scheduling" explanation={<><p className="text-sm leading-6 text-[#497c4f]">A queue protects arrival order: first in, first out. It makes fair scheduling possible.</p><div className="mt-5 flex items-center gap-3 text-xs text-[#857565]"><ArrowRight className="text-[#6f9a72]" size={17} />enqueue at the rear<br /><ArrowRight className="text-[#6f8f63]" size={17} />dequeue at the front</div></>}><div className="flex min-h-[250px] items-center justify-center"><div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-[#a4caa9] bg-[#f4f8f0] p-4">{items.map((item, i) => <div key={item} className={`rounded-lg border px-4 py-3 mono text-xs ${i === 0 ? 'border-[#95c6a5] bg-[#d3e6da] text-[#407752]' : 'border-[#cce1ce] bg-[#eef5ea] text-[#528b59]'}`}>{item}</div>)}{!items.length && <span className="mono text-xs text-[#b7aca0]">empty queue</span>}</div></div><div className="flex flex-wrap justify-center gap-2"><input value={value} onChange={(e) => setValue(e.target.value)} className="w-32 rounded-lg border border-[#c8dfcb] bg-[#fbf6ea] px-3 py-2 mono text-xs text-[#46774d] outline-none" data-testid="input-queue-value" /><Button onClick={() => { if (value) setItems([...items, value]); }} testId="button-queue-enqueue"><Plus size={13} /> Enqueue</Button><Button variant="quiet" onClick={() => setItems(items.slice(1))} testId="button-queue-dequeue"><Minus size={13} /> Dequeue</Button><Button variant="quiet" onClick={() => alert(items[0] ? `Front: ${items[0]}` : 'Queue is empty')} testId="button-queue-peek"><Eye size={13} /> Peek</Button><Button variant="quiet" onClick={() => setItems([])} testId="button-queue-clear">Clear</Button></div></LabFrame>;
}

function TreeLab() {
  const [values, setValues] = useState([50, 25, 75, 12, 35, 62, 88]);
  const [input, setInput] = useState('42');
  const [output, setOutput] = useState('50 → 25 → 12 → 35 → 75 → 62 → 88');
  const add = () => {
    const n = Number(input);
    if (Number.isFinite(n) && !values.includes(n)) setValues([...values, n].sort((a, b) => a - b));
  };
  return <LabFrame title="Binary search tree" kicker="Hierarchy / ordering" explanation={
    <div><p className="text-sm leading-6 text-[#497c4f]">Every value to the left is smaller; every value to the right is larger. That promise turns a search into a series of deliberate choices.</p><div className="mt-5 mono text-[11px] leading-6 text-[#548f5c]">search cost<br /><span className="text-[#6f8f63]">balanced → O(log n)</span><br /><span className="text-[#8a3e4a]">skewed → O(n)</span></div></div>
  }>
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 py-5">
      <div className="grid size-14 place-items-center rounded-full border border-[#54905c] bg-[#cee2d0] mono text-sm font-bold text-[#3a6440]">50</div>
      <div className="flex w-2/3 justify-between border-t border-dashed border-[#9ac39f] pt-3">
        <div className="flex flex-col items-center gap-3"><span className="grid size-12 place-items-center rounded-full border border-[#a5caaa] bg-[#eef5ea] mono text-xs text-[#45764b]">25</span><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-full border border-[#c8dfcb] bg-[#deeadf] mono text-[11px] text-[#55905d]">12</span><span className="grid size-10 place-items-center rounded-full border border-[#c8dfcb] bg-[#deeadf] mono text-[11px] text-[#55905d]">35</span></div></div>
        <div className="flex flex-col items-center gap-3"><span className="grid size-12 place-items-center rounded-full border border-[#a5caaa] bg-[#eef5ea] mono text-xs text-[#45764b]">75</span><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-full border border-[#c8dfcb] bg-[#deeadf] mono text-[11px] text-[#55905d]">62</span><span className="grid size-10 place-items-center rounded-full border border-[#c8dfcb] bg-[#deeadf] mono text-[11px] text-[#55905d]">88</span></div></div>
      </div>
      <div className="text-center mono text-[11px] text-[#56925e]" data-testid="text-tree-traversal">{output}</div>
      <Controls>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="w-24 rounded-lg border border-[#c8dfcb] bg-[#fbf6ea] px-3 py-2 mono text-xs text-[#46774d] outline-none" data-testid="input-tree-value" />
        <Button onClick={add} testId="button-tree-insert"><Plus size={13} /> Insert</Button>
        <Button variant="quiet" onClick={() => setValues(values.filter((v) => v !== Number(input)))} testId="button-tree-delete"><Trash2 size={13} /> Delete</Button>
        <Button variant="quiet" onClick={() => setOutput(values.includes(Number(input)) ? `${input} found along the search path.` : `${input} is not in the tree.`)} testId="button-tree-search"><Search size={13} /> Search</Button>
         <Button variant="quiet" onClick={() => setOutput([...values].sort((a, b) => a - b).join(' → '))} testId="button-tree-inorder">In-order</Button>
         <Button variant="quiet" onClick={() => setOutput([50, 25, 12, 35, 75, 62, 88].filter((value) => values.includes(value)).join(' → '))} testId="button-tree-preorder">Pre-order</Button>
         <Button variant="quiet" onClick={() => setOutput([12, 35, 25, 62, 88, 75, 50].filter((value) => values.includes(value)).join(' → '))} testId="button-tree-postorder">Post-order</Button>
         <Button variant="quiet" onClick={() => setOutput(values.join(' → '))} testId="button-tree-levelorder">Level-order</Button>
      </Controls>
    </div>
  </LabFrame>;
}

function SearchLab() {
  const [algorithm, setAlgorithm] = useState('linear'); const [arr, setArr] = useState([8, 14, 21, 29, 37, 44, 58]); const [target, setTarget] = useState('37'); const [step, setStep] = useState(-1); const [message, setMessage] = useState('Press next to inspect the first candidate.');
  const next = () => { const n = Number(target); const nextStep = step + 1; if (nextStep >= arr.length) { setMessage(arr.includes(n) ? `Found ${n}.` : `${n} is not present.`); return; } setStep(nextStep); setMessage(arr[nextStep] === n ? `Found ${n} at index ${nextStep}.` : `Checked index ${nextStep}: ${arr[nextStep]} is not ${n}.`); };
  return <LabFrame title="Searching" kicker="Compare / narrow" explanation={<><p className="text-sm leading-6 text-[#497c4f]">Linear search checks each element. Binary search discards half the remaining options, but only after the array is sorted.</p><div className="mt-5 space-y-2 mono text-[11px]"><div className="text-[#6f9a72]">linear · O(n)</div><div className="text-[#6f8f63]">binary · O(log n)</div></div></>}><div className="flex gap-2">{['linear', 'binary'].map((x) => <button key={x} onClick={() => { setAlgorithm(x); setStep(-1); setMessage('Press next to inspect the first candidate.'); }} className={`rounded-md border px-3 py-1.5 text-xs font-bold ${algorithm === x ? 'border-[#97c29d] bg-[#d1e4d4] text-[#3b6541]' : 'border-[#cfe3d1] text-[#b1a598]'}`} data-testid={`button-search-${x}`}>{x === 'linear' ? 'Linear search' : 'Binary search'}</button>)}</div><div className="my-16 flex flex-wrap justify-center gap-2">{arr.map((n, i) => <div key={n} className={`grid size-14 place-items-center rounded-lg border mono text-sm ${step === i ? 'border-[#6f9a72] bg-[#d0e4d6] text-[#3d714e]' : 'border-[#c0dac3] bg-[#eef5ea] text-[#46784d]'}`}><span className="absolute mt-20 text-[10px] text-[#9ac4a0]">{i}</span>{n}</div>)}</div><div className="flex flex-wrap items-center justify-center gap-2"><input value={target} onChange={(e) => setTarget(e.target.value)} className="w-24 rounded-lg border border-[#c8dfcb] bg-[#fbf6ea] px-3 py-2 mono text-xs text-[#46774d] outline-none" data-testid="input-search-target" /><Button onClick={next} testId="button-search-next"><StepForward size={13} /> Next comparison</Button><Button variant="quiet" onClick={() => { setStep(-1); setMessage('Search reset.'); }} testId="button-search-reset"><RotateCcw size={13} /> Reset</Button></div><div className="mt-4 text-center mono text-[11px] text-[#55915d]" data-testid="status-search-operation">{message}</div></LabFrame>;
}

function SortLab() {
  const [values, setValues] = useState([32, 74, 48, 91, 25, 60, 43, 79, 55]); const [algorithm, setAlgorithm] = useState('bubble'); const [step, setStep] = useState(0); const [running, setRunning] = useState(false);
  const advance = () => { const next = [...values]; const i = step % Math.max(1, next.length - 1); if (next[i] > next[i + 1]) [next[i], next[i + 1]] = [next[i + 1], next[i]]; setValues(next); setStep(step + 1); };
  return <LabFrame title="Sorting" kicker="Order / compare" explanation={<><p className="text-sm leading-6 text-[#497c4f]">Sorting is a conversation between neighboring values. Watch the comparisons, not just the final shape.</p><div className="mt-5 space-y-2 text-xs text-[#aea194]"><div><span className="text-[#6f8f63]">Bubble</span> · repeated neighbor swaps</div><div><span className="text-[#6f9a72]">Merge</span> · split, sort, combine</div><div><span className="text-[#e6b48c]">Quick</span> · partition around a pivot</div></div></>}><div className="flex flex-wrap gap-2">{['bubble', 'selection', 'insertion', 'merge', 'quick'].map((x) => <button key={x} onClick={() => setAlgorithm(x)} className={`rounded-md border px-3 py-1.5 text-xs font-bold capitalize ${algorithm === x ? 'border-[#97c29d] bg-[#d1e4d4] text-[#3b6541]' : 'border-[#cfe3d1] text-[#b1a598]'}`} data-testid={`button-sort-${x}`}>{x}</button>)}</div><div className="mt-12 flex h-48 items-end justify-center gap-2 border-b border-[#bcd8c0] px-4">{values.map((v, i) => <div key={i} className="bar group relative w-7 rounded-t-md bg-[#56935e] hover:bg-[#6f8f63]" style={{ height: `${v}%` }}><span className="absolute -top-5 left-1/2 -translate-x-1/2 mono text-[9px] text-[#afa295]">{v}</span></div>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-5 mono text-[10px] text-[#b4a89c]"><span>comparisons <b className="text-[#487b4f]">{step}</b></span><span>algorithm <b className="text-[#487b4f]">{algorithm}</b></span></div><div className="flex gap-2"><Button onClick={advance} testId="button-sort-step">{running ? <Pause size={13} /> : <StepForward size={13} />} Step</Button><Button variant="quiet" onClick={() => { setValues([32, 74, 48, 91, 25, 60, 43, 79, 55]); setStep(0); setRunning(false); }} testId="button-sort-reset"><RotateCcw size={13} /> Reset</Button></div></div></LabFrame>;
}

function HashLab() {
  const [entries, setEntries] = useState(['name → Ada', 'role → learner', 'focus → Python', 'pace → steady']); const [value, setValue] = useState('goal → understand');
  return <LabFrame title="Hash table" kicker="Keys / lookup" explanation={<><p className="text-sm leading-6 text-[#497c4f]">Hashing turns a key into a bucket location. The lookup feels instant until two keys land in the same place.</p><div className="mt-5 mono text-[11px] leading-6 text-[#548f5c]">average lookup<br /><span className="text-[#6f9a72]">O(1)</span><br />collision handling matters</div></>}><div className="grid gap-2 sm:grid-cols-2">{[0, 1, 2, 3, 4, 5].map((bucket) => <div key={bucket} className="flex min-h-16 items-center gap-3 rounded-lg border border-[#cce1cf] bg-[#f4f8f0] p-3"><span className="mono text-[10px] text-[#baaea3]">0{bucket}</span><div className="flex flex-wrap gap-2">{entries.filter((_, i) => i % 6 === bucket).map((entry) => <span key={entry} className="rounded-md border border-[#a2c8a7] bg-[#d3e5d6] px-2 py-1 mono text-[10px] text-[#427048]">{entry}</span>)}</div></div>)}</div><Controls><input value={value} onChange={(e) => setValue(e.target.value)} className="w-52 rounded-lg border border-[#c8dfcb] bg-[#fbf6ea] px-3 py-2 mono text-xs text-[#46774d] outline-none" data-testid="input-hash-value" /><Button onClick={() => { if (value) setEntries([...entries, value]); }} testId="button-hash-set"><Plus size={13} /> Set key</Button><Button variant="quiet" onClick={() => setEntries([])} testId="button-hash-clear">Clear table</Button></Controls></LabFrame>;
}

function HeapLab() {
  const [values, setValues] = useState([12, 24, 18, 39, 31, 27, 44]); const [input, setInput] = useState('9');
  return <LabFrame title="Min heap" kicker="Priority / parent" explanation={<><p className="text-sm leading-6 text-[#497c4f]">A min heap keeps the smallest value at its root. Each insert bubbles upward until the parent is smaller.</p><div className="mt-5 rounded-lg border border-[#c8dfcb] bg-[#eef5ea] p-3 mono text-[11px] text-[#538d5b]">parent(i) = floor((i − 1) / 2)</div></>}><div className="flex min-h-[250px] flex-col items-center gap-4 py-4"><div className="grid size-14 place-items-center rounded-full border border-[#54905c] bg-[#cee2d0] mono text-sm font-bold text-[#3a6440]">{values[0]}</div><div className="flex flex-wrap justify-center gap-2">{values.slice(1).map((v) => <span key={v} className="grid size-12 place-items-center rounded-full border border-[#bcd7bf] bg-[#eef5ea] mono text-xs text-[#45764b]">{v}</span>)}</div></div><Controls><input value={input} onChange={(e) => setInput(e.target.value)} className="w-20 rounded-lg border border-[#c8dfcb] bg-[#fbf6ea] px-3 py-2 mono text-xs text-[#46774d] outline-none" data-testid="input-heap-value" /><Button onClick={() => { const n = Number(input); if (Number.isFinite(n)) setValues([...values, n].sort((a, b) => a - b)); }} testId="button-heap-insert"><Plus size={13} /> Insert</Button><Button variant="quiet" onClick={() => setValues(values.slice(1))} testId="button-heap-extract">Extract min</Button><Button variant="quiet" onClick={() => setValues([12, 24, 18, 39, 31, 27, 44])} testId="button-heap-reset">Reset</Button></Controls></LabFrame>;
}

function GraphLab() {
  const [visited, setVisited] = useState<number[]>([]); const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5]];
  const run = (mode: 'BFS' | 'DFS') => setVisited(mode === 'BFS' ? [0, 1, 2, 3, 4, 5] : [0, 1, 3, 5, 2, 4]);
  return <LabFrame title="Graph traversal" kicker="Paths / neighbors" explanation={<><p className="text-sm leading-6 text-[#497c4f]">BFS explores layer by layer. DFS follows one path as far as it can before backtracking. Both need a visited set.</p><div className="mt-5 flex gap-3 mono text-[11px]"><span className="text-[#6f9a72]">BFS · queue</span><span className="text-[#6f8f63]">DFS · stack</span></div></>}><div className="relative mx-auto h-64 max-w-[560px]">{edges.map(([a, b], edgeIndex) => <div key={`${a}-${b}`} className="absolute h-px origin-left bg-[#a2c8a7]" style={{ left: `${[18, 18, 54, 54, 54, 70][edgeIndex]}%`, top: `${[42, 42, 42, 42, 59, 59][edgeIndex]}%`, width: '23%', transform: `rotate(${a === 0 ? (b === 1 ? -23 : 23) : b === 3 ? (a === 1 ? 23 : -23) : 23}deg)` }} />)}{[0, 1, 2, 3, 4, 5].map((n) => <div key={n} className={`absolute grid size-12 place-items-center rounded-full border mono text-xs font-bold ${visited.includes(n) ? 'border-[#6f9a72] bg-[#d0e4d6] text-[#3d714e]' : 'border-[#a2c8a7] bg-[#d4e6d7] text-[#427048]'}`} style={{ left: `${[12, 37, 62, 37, 62, 78][n]}%`, top: `${[30, 12, 12, 55, 55, 78][n]}%` }}>{n}</div>)}</div><div className="flex justify-center gap-2"><Button onClick={() => run('BFS')} testId="button-graph-bfs">Run BFS</Button><Button variant="ghost" onClick={() => run('DFS')} testId="button-graph-dfs">Run DFS</Button><Button variant="quiet" onClick={() => setVisited([])} testId="button-graph-reset"><RotateCcw size={13} /> Reset</Button></div><div className="mt-4 text-center mono text-[11px] text-[#55915d]" data-testid="text-graph-order">{visited.length ? `visit order: ${visited.join(' → ')}` : 'choose a traversal to begin'}</div></LabFrame>;
}

function Features() {
  const features = [{ icon: Lightbulb, title: 'Hints with a handrail', copy: 'Three questions before the answer. Each hint narrows the space without stealing the discovery.' }, { icon: Workflow, title: 'Algorithms you can touch', copy: 'Manipulate nodes, pointers, buckets, and bars. See complexity become something you can feel.' }, { icon: LockKeyhole, title: 'A private practice room', copy: 'Your code is used for the review in front of you. No public profile, no leaderboard pressure.' }, { icon: Terminal, title: 'Made for real Python', copy: 'Work with loops, functions, lists, and the small bugs that make you a better programmer.' }];
  return <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-16 lg:px-8 lg:pt-24"><SectionTitle eyebrow="Why CodeLens" title="A quieter way to get unstuck." copy="The fastest way to learn a pattern is to notice it yourself. CodeLens turns the pause before the fix into a place to practice." /><div className="grid gap-4 md:grid-cols-2">{features.map((f, i) => { const Icon = f.icon; return <article key={f.title} className={`panel p-6 ${i === 0 ? 'md:translate-y-8' : ''}`}><div className="mb-12 grid size-10 place-items-center rounded-lg border border-[#9ec6a3] bg-[#d1e4d4] text-[#7f9c73]"><Icon size={18} /></div><h2 className="text-xl font-extrabold text-[#3a6340]">{f.title}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#847464]">{f.copy}</p></article>; })}</div><div className="panel-soft mt-20 grid gap-7 p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><div className="eyebrow mb-3">The practice loop</div><h2 className="text-2xl font-extrabold text-[#38603e]">Notice. Test. Explain.</h2></div><div className="grid gap-3 sm:grid-cols-3">{['01 / Notice a signal', '02 / Follow a hint', '03 / Name the pattern'].map((x, i) => <div key={x} className="rounded-lg border border-[#cce1cf] bg-[#f1f6ec] p-4"><span className="mono text-[10px] text-[#6f8f63]">{x.split(' / ')[0]}</span><p className="mt-3 text-xs font-semibold text-[#487a4e]">{x.split(' / ')[1]}</p>{i < 2 && <ArrowRight className="mt-4 text-[#9cc5a2]" size={14} />}</div>)}</div></div></div>;
}

const docs = [{ tag: '01', title: 'Big O, without the fog', copy: 'A field guide to asking what grows when your input grows.', color: 'violet' }, { tag: '02', title: 'Pointers and references', copy: 'Why linked lists are really lessons about memory.', color: 'teal' }, { tag: '03', title: 'Recursion as a conversation', copy: 'Base cases, smaller questions, and the call stack.', color: 'gold' }, { tag: '04', title: 'Choosing a structure', copy: 'Trade lookup speed, order, and memory with confidence.', color: 'violet' }];
function Docs() {
  const [selected, setSelected] = useState(0);
  const doc = docs[selected];
  return <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-16 lg:px-8 lg:pt-24"><SectionTitle eyebrow="Reference / field notes" title="The concepts, in plain language." copy="Short reading for the moments when a definition is not enough. Pair each note with a module in the DSA Lab." /><div className="grid gap-5 lg:grid-cols-[300px_1fr]"><aside className="panel h-fit p-2">{docs.map((d, i) => <button key={d.tag} onClick={() => setSelected(i)} className={`flex w-full items-start gap-3 rounded-lg p-4 text-left transition-colors ${selected === i ? 'bg-[#d3e5d5]' : 'hover:bg-[#dfeae0]'}`} data-testid={`button-doc-${i}`}><span className="mono text-[10px] text-[#6f8f63]">{d.tag}</span><span><span className="block text-sm font-bold text-[#3f6c45]">{d.title}</span><span className="mt-1 block text-xs leading-5 text-[#b4a89c]">{d.copy}</span></span></button>)}</aside><article className="panel min-h-[420px] p-6 sm:p-9"><div className="flex items-center justify-between"><span className="eyebrow">Field note {doc.tag}</span><BookOpen size={16} className="text-[#8bbb92]" /></div><h2 className="mt-12 max-w-xl text-3xl font-extrabold tracking-tight text-[#38603e] sm:text-4xl">{doc.title}</h2><div className="mt-8 max-w-2xl space-y-5 text-sm leading-7 text-[#7b6c5c]"><p>{doc.copy} Start with the question the structure is answering, then look at the mechanics.</p><div className="rounded-lg border border-[#c5ddc9] bg-[#dce9de] p-5 mono text-[12px] leading-6 text-[#46774d]"># the useful question<br /><span className="text-[#6f9a72]">what work can I avoid by choosing this shape?</span></div><p>When the answer is clear, the implementation becomes less mysterious. Return to the lab and change one thing at a time.</p></div><Link href="/dsa" className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#7f9c73] hover:text-[#3a6440]" data-testid="link-docs-lab">Open the lab <ArrowRight size={14} /></Link></article></div></div>;
}

function About() {
  return <div className="mx-auto max-w-[1000px] px-5 pb-16 pt-16 lg:px-8 lg:pt-24"><div className="panel overflow-hidden"><div className="grid gap-10 p-7 sm:p-12 lg:grid-cols-[.65fr_1fr]"><div><div className="eyebrow mb-4">Meet the founder</div><h1 className="display text-5xl font-extrabold text-[#385f3d]">Built by someone<br /><span className="text-[#6f8f63]">who got stuck too.</span></h1></div><div className="space-y-5 text-sm leading-7 text-[#7b6c5d]"><p>CodeLens started as a small question: what if a coding tool was patient enough to let the learner finish the thought?</p><p>It is shaped around deliberate practice, friendly friction, and explanations you can carry to the next problem.</p><div className="border-l border-[#95c19b] pl-4 text-[#44744a]">“A useful hint should make the next step feel possible.”</div></div></div><div className="grid gap-px border-t border-[#d0e4d3] bg-[#d0e4d3] sm:grid-cols-3"><div className="bg-[#f4f8f0] p-5"><div className="mono text-[10px] text-[#6f8f63]">01</div><p className="mt-3 text-xs text-[#827262]">Curiosity over completion</p></div><div className="bg-[#f4f8f0] p-5"><div className="mono text-[10px] text-[#6f9a72]">02</div><p className="mt-3 text-xs text-[#827262]">Clarity over cleverness</p></div><div className="bg-[#f4f8f0] p-5"><div className="mono text-[10px] text-[#d99f74]">03</div><p className="mt-3 text-xs text-[#827262]">Practice over performance</p></div></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="panel-soft flex gap-4 p-5"><div><div className="eyebrow">Founder profile</div><h2 className="mt-2 text-lg font-extrabold text-[#3a6440]">Pritha Dey</h2><p className="mt-1 text-xs text-[#837363]">Founder &amp; Creator of CodeLens</p><p className="mt-3 text-xs leading-5 text-[#78695b]">Pritha Dey is a self-taught developer who learned data structures the slow way — by getting stuck, re-reading the same explanation five times, and finally drawing it out on paper. She built CodeLens as the tool she wished existed then: one that asks a better question instead of pasting an answer. She works across React, TypeScript and Python, and cares most about the moment a concept finally clicks.</p></div></div><div className="panel-soft p-5"><div className="eyebrow">The work behind it</div><div className="mt-3 grid gap-3 text-xs text-[#78695b]"><p><span className="font-bold text-[#406d46]">Why CodeLens was created</span><br />To make programming education more interactive and understandable.</p><p><span className="font-bold text-[#406d46]">Vision</span><br />A learning space where every review leaves you a little more independent — hints before solutions, reasons before rules, and visual intuition for the structures that everything else is built on.</p><p><span className="font-bold text-[#406d46]">Technologies</span><br />React · Vite · Python · FastAPI</p><p><span className="font-bold text-[#406d46]">Achievements / projects</span><br />Built and shipped CodeLens end to end — analyzer, API and nine interactive DSA visualizers.<br />Designed a guided three-hint review flow now used to teach Python, Java and C++ habits.<br />Mentors beginners through their first data-structure projects.</p></div></div></div><div className="mt-6 flex flex-wrap items-center gap-4"><Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#7f9c73]" data-testid="link-about-review">Try a review <ArrowRight size={14} /></Link><a href="#founder-social" className="inline-flex items-center gap-2 text-xs font-bold text-[#b2a598]" data-testid="link-about-social">[Social link] <ExternalLink size={13} /></a><a href="mailto:hello@codelens.dev" className="inline-flex items-center gap-2 text-xs font-bold text-[#b2a598]" data-testid="link-about-email">Say hello <ExternalLink size={13} /></a></div></div>;
}

function Router() {
  return <Switch><WRoute path="/" component={Home} /><WRoute path="/dsa" component={DsaLab} /><WRoute path="/features" component={Features} /><WRoute path="/docs" component={Docs} /><WRoute path="/about" component={About} /><WRoute component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Shell><Router /></Shell></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;