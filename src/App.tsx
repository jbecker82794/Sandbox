import { useState, useEffect, useRef, useCallback } from "react";
import ParticleBackground from "./ParticleBackground";
import ExplosionCanvas from "./ExplosionCanvas";

// ─── Typewriter Hook ───────────────────────────────────────────────
function useTypewriter(texts: string[], speed = 50, pause = 2000) {
  const [display, setDisplay] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let textIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = texts[textIndex];
      if (!deleting) {
        setDisplay(current.slice(0, charIndex + 1));
        charIndex++;
        if (charIndex >= current.length) {
          deleting = true;
          timeout = setTimeout(tick, pause);
          return;
        }
        timeout = setTimeout(tick, speed);
      } else {
        setDisplay(current.slice(0, charIndex - 1));
        charIndex--;
        if (charIndex <= 0) {
          deleting = false;
          textIndex = (textIndex + 1) % texts.length;
          timeout = setTimeout(tick, speed * 4);
          return;
        }
        timeout = setTimeout(tick, speed / 2);
      }
    };

    timeout = setTimeout(tick, speed * 6);

    const cursorInterval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);

    return () => {
      clearTimeout(timeout);
      clearInterval(cursorInterval);
    };
  }, [texts, speed, pause]);

  return { display, cursorVisible };
}

// ─── Section Visibility Hook ────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Calculator Component ──────────────────────────────────────────
function Calculator({ dark }: { dark: boolean }) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const input = (val: string) => {
    if (fresh) {
      setDisplay(val);
      setFresh(false);
    } else {
      setDisplay((d) => (d === "0" ? val : d + val));
    }
  };

  const operate = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op) {
      let result = prev;
      if (op === "+") result = prev + current;
      if (op === "-") result = prev - current;
      if (op === "×") result = prev * current;
      if (op === "÷") result = current !== 0 ? prev / current : NaN;
      setDisplay(isNaN(result) ? "Error" : String(parseFloat(result.toFixed(10))));
      setPrev(isNaN(result) ? null : result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  };

  const equals = () => {
    if (prev === null || !op) return;
    operate(op);
    setOp(null);
  };

  const clear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const bg = dark ? "bg-gray-800/60" : "bg-white/80";
  const btnBase = `w-full aspect-square rounded-xl text-lg font-semibold transition-all duration-150 cursor-pointer active:scale-95`;
  const btnNum = dark
    ? "bg-gray-700/80 hover:bg-gray-600 text-white"
    : "bg-gray-100 hover:bg-gray-200 text-gray-800";
  const btnOp = dark
    ? "bg-indigo-600/80 hover:bg-indigo-500 text-white"
    : "bg-indigo-500 hover:bg-indigo-400 text-white";
  const btnSpecial = dark
    ? "bg-gray-600/80 hover:bg-gray-500 text-white"
    : "bg-gray-300 hover:bg-gray-400 text-gray-800";

  return (
    <div className={`${bg} backdrop-blur-xl rounded-2xl p-4 w-full max-w-[280px] border ${dark ? "border-white/10" : "border-gray-200"}`}>
      <div className={`text-right text-3xl font-mono p-3 mb-3 rounded-xl truncate ${dark ? "bg-gray-900/80 text-white" : "bg-gray-50 text-gray-900"}`}>
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button className={`${btnBase} ${btnSpecial}`} onClick={clear}>C</button>
        <button className={`${btnBase} ${btnSpecial}`} onClick={() => setDisplay((d) => String(parseFloat(d) * -1))}>±</button>
        <button className={`${btnBase} ${btnSpecial}`} onClick={() => setDisplay((d) => String(parseFloat(d) / 100))}>%</button>
        <button className={`${btnBase} ${btnOp}`} onClick={() => operate("÷")}>÷</button>

        {["7", "8", "9"].map((n) => (
          <button key={n} className={`${btnBase} ${btnNum}`} onClick={() => input(n)}>{n}</button>
        ))}
        <button className={`${btnBase} ${btnOp}`} onClick={() => operate("×")}>×</button>

        {["4", "5", "6"].map((n) => (
          <button key={n} className={`${btnBase} ${btnNum}`} onClick={() => input(n)}>{n}</button>
        ))}
        <button className={`${btnBase} ${btnOp}`} onClick={() => operate("-")}>-</button>

        {["1", "2", "3"].map((n) => (
          <button key={n} className={`${btnBase} ${btnNum}`} onClick={() => input(n)}>{n}</button>
        ))}
        <button className={`${btnBase} ${btnOp}`} onClick={() => operate("+")}>+</button>

        <button className={`${btnBase} ${btnNum} col-span-2`} onClick={() => input("0")}>0</button>
        <button className={`${btnBase} ${btnNum}`} onClick={() => {
          if (!display.includes(".")) setDisplay((d) => d + ".");
          setFresh(false);
        }}>.</button>
        <button className={`${btnBase} bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500`} onClick={equals}>=</button>
      </div>
    </div>
  );
}

// ─── Todo List Component ────────────────────────────────────────────
interface TodoItem {
  id: number;
  text: string;
  done: boolean;
}

function TodoList({ dark }: { dark: boolean }) {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem("claude-showcase-todos");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("claude-showcase-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((t) => [...t, { id: Date.now(), text, done: false }]);
    setInput("");
  };

  const toggle = (id: number) => {
    setTodos((t) => t.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const remove = (id: number) => {
    setTodos((t) => t.filter((item) => item.id !== id));
  };

  const bg = dark ? "bg-gray-800/60" : "bg-white/80";

  return (
    <div className={`${bg} backdrop-blur-xl rounded-2xl p-5 w-full max-w-sm border ${dark ? "border-white/10" : "border-gray-200"}`}>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a task..."
          className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
            dark
              ? "bg-gray-900/80 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50"
              : "bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-400/50"
          }`}
        />
        <button
          onClick={addTodo}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-400 hover:to-purple-500 transition-all active:scale-95 cursor-pointer"
        >
          Add
        </button>
      </div>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {todos.length === 0 && (
          <p className={`text-center text-sm py-4 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            No tasks yet. Add one above!
          </p>
        )}
        {todos.map((todo) => (
          <div
            key={todo.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              dark ? "bg-gray-700/50 hover:bg-gray-700/80" : "bg-gray-100/80 hover:bg-gray-100"
            }`}
          >
            <button
              onClick={() => toggle(todo.id)}
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                todo.done
                  ? "bg-indigo-500 border-indigo-500"
                  : dark
                  ? "border-gray-500 hover:border-indigo-400"
                  : "border-gray-300 hover:border-indigo-400"
              }`}
            >
              {todo.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm ${todo.done ? "line-through opacity-50" : ""} ${dark ? "text-gray-200" : "text-gray-700"}`}>
              {todo.text}
            </span>
            <button
              onClick={() => remove(todo.id)}
              className={`text-sm opacity-40 hover:opacity-100 transition-opacity cursor-pointer ${dark ? "text-red-400" : "text-red-500"}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      {todos.length > 0 && (
        <div className={`mt-3 text-xs text-center ${dark ? "text-gray-500" : "text-gray-400"}`}>
          {todos.filter((t) => t.done).length}/{todos.length} completed · Saved to localStorage
        </div>
      )}
    </div>
  );
}

// ─── Particle Clicker Component ─────────────────────────────────────
function ParticleClicker({
  dark,
  onExplode,
}: {
  dark: boolean;
  onExplode: () => void;
}) {
  const [count, setCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  const handleClick = () => {
    const next = count + 1;
    setCount(next);
    if (next % 10 === 0) {
      onExplode();
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  const bg = dark ? "bg-gray-800/60" : "bg-white/80";

  return (
    <div className={`${bg} backdrop-blur-xl rounded-2xl p-6 w-full max-w-[280px] border ${dark ? "border-white/10" : "border-gray-200"} flex flex-col items-center gap-4`}>
      <button
        onClick={handleClick}
        className={`relative px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 cursor-pointer ${
          dark
            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
            : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-400/30 hover:shadow-indigo-400/50"
        } hover:scale-105 active:scale-95 animate-pulse-glow`}
      >
        Count: {count}
      </button>

      <div className="w-full flex flex-col items-center gap-2">
        <div className={`w-full h-2 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(count % 10) * 10}%` }}
          />
        </div>
        <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
          {10 - (count % 10)} clicks to explosion
        </span>
      </div>

      {showMessage && (
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-bounce">
          BOOM!
        </span>
      )}
    </div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────
function FeatureCard({
  dark,
  icon,
  title,
  description,
  gradient,
}: {
  dark: boolean;
  icon: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div
      className={`group relative rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-default ${
        dark
          ? "bg-gray-800/40 border-white/10 hover:border-white/20 hover:bg-gray-800/60"
          : "bg-white/60 border-gray-200 hover:border-gray-300 hover:bg-white/90"
      } backdrop-blur-xl`}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}>{title}</h3>
      <p className={`text-sm leading-relaxed ${dark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
    </div>
  );
}

// ─── Nav Link ──────────────────────────────────────────────────────
function NavLink({
  href,
  children,
  dark,
}: {
  href: string;
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <a
      href={href}
      className={`text-sm font-medium transition-colors duration-200 ${
        dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </a>
  );
}

// ─── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [explosionTrigger, setExplosionTrigger] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const heroTexts = [
    "Write production-ready code",
    "Analyze complex data sets",
    "Create interactive artifacts",
    "Debug tricky edge cases",
    "Generate stunning visuals",
    "Explain quantum physics simply",
    "Build full-stack applications",
  ];

  const { display, cursorVisible } = useTypewriter(heroTexts, 45, 1800);

  const demosSection = useInView();
  const featuresSection = useInView();

  const handleExplode = useCallback(() => {
    setExplosionTrigger((t) => t + 1);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <ParticleBackground dark={dark} />
      <ExplosionCanvas trigger={explosionTrigger} />

      {/* ─── Navbar ───────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
          dark ? "bg-gray-950/70 border-white/5" : "bg-white/70 border-gray-200/50"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Claude Showcase</span>
          </div>

          <div className="hidden sm:flex items-center gap-8">
            <NavLink href="#hero" dark={dark}>Home</NavLink>
            <NavLink href="#demos" dark={dark}>Demos</NavLink>
            <NavLink href="#features" dark={dark}>Features</NavLink>
          </div>

          <button
            onClick={() => setDark((d) => !d)}
            className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
              dark
                ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                : "bg-black/5 border-black/10 text-gray-800 hover:bg-black/10"
            }`}
          >
            {dark ? "☀ Light" : "● Dark"}
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ────────────────────────────────────── */}
      <section id="hero" className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="animate-fade-in-up flex flex-col items-center text-center max-w-4xl">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 ${
            dark ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border border-indigo-200"
          }`}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Powered by Claude Opus 4
          </div>

          <h1 className={`text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6 ${
            dark
              ? "bg-gradient-to-b from-white via-white to-gray-500"
              : "bg-gradient-to-b from-gray-900 via-gray-900 to-gray-400"
          } bg-clip-text text-transparent`}>
            What Claude
            <br />
            Can Do
          </h1>

          <div className="h-16 flex items-center">
            <span className={`text-xl sm:text-2xl lg:text-3xl font-light ${dark ? "text-indigo-300" : "text-indigo-600"}`}>
              {display}
              <span
                className={`inline-block w-[2px] h-[1em] ml-1 align-middle ${dark ? "bg-indigo-400" : "bg-indigo-600"}`}
                style={{ opacity: cursorVisible ? 1 : 0 }}
              />
            </span>
          </div>

          <p className={`max-w-2xl text-base sm:text-lg leading-relaxed mt-6 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            Explore live, interactive demos that showcase the breadth of Claude's capabilities.
            Everything on this page was built by Claude itself.
          </p>

          <div className="flex flex-wrap gap-4 mt-10 justify-center">
            <a
              href="#demos"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95"
            >
              Try the Demos
            </a>
            <a
              href="#features"
              className={`px-8 py-3.5 rounded-2xl font-semibold text-sm border transition-all duration-300 hover:scale-105 active:scale-95 ${
                dark
                  ? "border-white/15 text-white hover:bg-white/10"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-float">
          <div className={`flex flex-col items-center gap-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── Interactive Demos Section ───────────────────────── */}
      <section id="demos" ref={demosSection.ref} className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${demosSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className={`text-4xl sm:text-5xl font-black tracking-tight mb-4 ${
              dark
                ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
            } bg-clip-text text-transparent`}>
              Interactive Demos
            </h2>
            <p className={`text-base max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-500"}`}>
              Each of these mini-apps was generated entirely by Claude. Go ahead, try them out.
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 delay-200 ${demosSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            {/* Demo 1: Particle Clicker */}
            <div className="flex flex-col items-center gap-4">
              <div className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                Particle Clicker
              </div>
              <ParticleClicker dark={dark} onExplode={handleExplode} />
              <p className={`text-xs text-center max-w-[240px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
                Click 10 times for a screen-wide particle explosion effect.
              </p>
            </div>

            {/* Demo 2: Calculator */}
            <div className="flex flex-col items-center gap-4">
              <div className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                Calculator
              </div>
              <Calculator dark={dark} />
              <p className={`text-xs text-center max-w-[240px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
                A fully functional calculator with standard operations.
              </p>
            </div>

            {/* Demo 3: Todo List */}
            <div className="flex flex-col items-center gap-4">
              <div className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                Todo List
              </div>
              <TodoList dark={dark} />
              <p className={`text-xs text-center max-w-[240px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
                Persists across page reloads using localStorage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Highlights ──────────────────────────────── */}
      <section id="features" ref={featuresSection.ref} className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 ${featuresSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <h2 className={`text-4xl sm:text-5xl font-black tracking-tight mb-4 ${
              dark
                ? "bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400"
                : "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
            } bg-clip-text text-transparent`}>
              Feature Highlights
            </h2>
            <p className={`text-base max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-500"}`}>
              Claude is more than a chatbot. It's a platform for building, creating, and exploring.
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-200 ${featuresSection.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <FeatureCard
              dark={dark}
              icon="✦"
              title="Artifacts"
              description="Claude can generate interactive code, documents, and visualizations that render in real-time right in the conversation."
              gradient="from-indigo-500 to-blue-600"
            />
            <FeatureCard
              dark={dark}
              icon="◈"
              title="Projects"
              description="Organize conversations with shared context, custom instructions, and uploaded knowledge bases for persistent workflows."
              gradient="from-purple-500 to-pink-600"
            />
            <FeatureCard
              dark={dark}
              icon="⌘"
              title="Claude Code"
              description="An agentic CLI tool that lets Claude operate directly in your terminal — reading, writing, and executing code autonomously."
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard
              dark={dark}
              icon="◎"
              title="Imagine with Claude"
              description="Generate beautiful images directly in conversation using Claude's integrated image generation capabilities."
              gradient="from-orange-500 to-red-600"
            />
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-16">
        <div className={`max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 border backdrop-blur-xl ${
          dark ? "bg-gray-800/30 border-white/5" : "bg-white/60 border-gray-200"
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "200M+", label: "Weekly Conversations" },
              { value: "200K", label: "Context Window" },
              { value: "95%", label: "User Satisfaction" },
              { value: "500+", label: "Enterprise Clients" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className={`text-2xl sm:text-3xl font-black ${
                  dark
                    ? "bg-gradient-to-r from-indigo-400 to-purple-400"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600"
                } bg-clip-text text-transparent`}>
                  {value}
                </div>
                <div className={`text-xs mt-1 font-medium ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className={`relative z-10 border-t ${dark ? "border-white/5" : "border-gray-200"}`}>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-sm">Built with Claude</span>
                <span className={`block text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  This entire page was generated by Claude
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-6 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
              <span>Anthropic © {new Date().getFullYear()}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Made with React + Tailwind</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Particles are interactive — move your mouse!</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
