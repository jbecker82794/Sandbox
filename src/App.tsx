import { useState, useEffect } from "react";
import ParticleBackground from "./ParticleBackground";
import ExplosionCanvas from "./ExplosionCanvas";

function App() {
  const [count, setCount] = useState(0);
  const [dark, setDark] = useState(true);
  const [explosionTrigger, setExplosionTrigger] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleClick = () => {
    const next = count + 1;
    setCount(next);
    if (next % 10 === 0) {
      setExplosionTrigger((t) => t + 1);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <ParticleBackground dark={dark} />
      <ExplosionCanvas trigger={explosionTrigger} />

      {/* Dark mode toggle */}
      <button
        onClick={() => setDark((d) => !d)}
        className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
          dark
            ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
            : "bg-black/5 border-black/10 text-gray-800 hover:bg-black/10"
        }`}
      >
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-8">
        <h1
          className={`text-5xl sm:text-7xl font-bold tracking-tight ${
            dark
              ? "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
          } bg-clip-text text-transparent`}
        >
          Particle Counter
        </h1>

        <p
          className={`text-lg ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          Click the button. Every 10 clicks = explosion!
        </p>

        <button
          onClick={handleClick}
          className={`group relative px-10 py-5 rounded-2xl text-2xl font-bold transition-all duration-300 cursor-pointer ${
            dark
              ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
              : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-400/30 hover:shadow-indigo-400/50"
          } hover:scale-105 active:scale-95`}
        >
          <span className="relative z-10">Count: {count}</span>
          <div
            className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              dark
                ? "bg-gradient-to-r from-purple-600 to-pink-600"
                : "bg-gradient-to-r from-purple-500 to-pink-500"
            } opacity-0 group-hover:opacity-100`}
          />
          <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white z-10 pointer-events-none">
            Count: {count}
          </span>
        </button>

        {/* Progress to next explosion */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-48 h-2 rounded-full overflow-hidden ${
              dark ? "bg-white/10" : "bg-black/10"
            }`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(count % 10) * 10}%` }}
            />
          </div>
          <span
            className={`text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}
          >
            {10 - (count % 10)} clicks to next explosion
          </span>
        </div>

        {/* Explosion message */}
        {showMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
            <span className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-bounce">
              BOOM!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
