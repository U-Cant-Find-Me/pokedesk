"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  FaBolt, FaClock, FaTrophy, FaUndo, FaShareAlt, 
  FaGamepad, FaCheck, FaTimes, FaPlay, FaMedal 
} from "react-icons/fa";
import PokeLoader from "@/components/PokeLoader";
import BackgroundCarousel from "@/components/BackgroundCarousel";
import pokemonDataset from "@/data/pokemon-dataset.json";

// Type specific premium badge styling (helper)
const TYPE_COLORS = {
  normal: 'bg-zinc-500 text-white border-zinc-400',
  fire: 'bg-orange-500 text-white border-orange-400',
  water: 'bg-blue-500 text-white border-blue-400',
  electric: 'bg-amber-400 text-gray-900 border-amber-300 font-semibold',
  grass: 'bg-green-500 text-white border-green-400',
  ice: 'bg-cyan-400 text-gray-900 border-cyan-300 font-semibold',
  fighting: 'bg-red-600 text-white border-red-500',
  poison: 'bg-purple-500 text-white border-purple-400',
  ground: 'bg-amber-600 text-white border-amber-500',
  flying: 'bg-indigo-400 text-white border-indigo-300',
  psychic: 'bg-pink-500 text-white border-pink-400',
  bug: 'bg-lime-500 text-white border-lime-400',
  rock: 'bg-yellow-700 text-white border-yellow-600',
  ghost: 'bg-purple-700 text-white border-purple-600',
  dragon: 'bg-indigo-600 text-white border-indigo-500',
  dark: 'bg-zinc-800 text-white border-zinc-700',
  steel: 'bg-slate-500 text-white border-slate-400',
  fairy: 'bg-pink-400 text-white border-pink-300',
};

// Generate a random solvable Pokemon question in-memory
function generateQuestion(dataset, quizMode = "mcq") {
  if (!dataset || dataset.length === 0) return null;
  
  // Normalize quizMode to string in case it's passed incorrectly
  const normalizedMode = String(quizMode || "mcq").toLowerCase();
  
  // MCQ mode supports comparing candidates (e.g. highest stat)
  // Type-In mode only supports single-target identification because there are no candidate buttons
  let qType;
  if (normalizedMode === "type") {
    const typeInQuestions = [0, 2, 3];
    qType = typeInQuestions[Math.floor(Math.random() * typeInQuestions.length)];
  } else {
    qType = Math.floor(Math.random() * 4);
  }

  const target = dataset[Math.floor(Math.random() * dataset.length)];
  
  // Helper to obtain unique wrong options
  const getWrongOptions = (filterFn, count = 3) => {
    const pool = dataset.filter(p => p.id !== target.id && filterFn(p));
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => p.name);
  };

  let questionText = "";
  let correctAnswer = target.name;
  let options = [];
  let silhouette = true; // Force silhouette structure for all questions
  let imageUrl = target.sprite || "/logo.png";

  // Fail-safe to prevent highest-stat question in type mode under any circumstance
  if (qType === 1 && normalizedMode === "type") {
    qType = 0;
  }

  if (qType === 0) {
    // Silhouette - "Who's That Pokémon?!"
    questionText = "WHO'S THAT POKÉMON?!";
    silhouette = true;
    const wrong = getWrongOptions(() => true, 3);
    options = [correctAnswer, ...wrong];
  } 
  else if (qType === 1) {
    // Highest Stat Question (Only in MCQ mode)
    const statsList = ["hp", "attack", "defense", "special_attack", "special_defense", "speed"];
    const stat = statsList[Math.floor(Math.random() * statsList.length)];
    const statLabel = stat.replace("_", " ").toUpperCase();
    
    // Pick 4 unique candidate Pokemon
    const candidates = [];
    while (candidates.length < 4) {
      const p = dataset[Math.floor(Math.random() * dataset.length)];
      if (!candidates.some(c => c.id === p.id)) {
        candidates.push(p);
      }
    }
    // Sort descending by selected stat
    candidates.sort((a, b) => (b.stats?.[stat] || 0) - (a.stats?.[stat] || 0));
    
    const highest = candidates[0];
    questionText = `Which of these Pokémon has the highest base ${statLabel}?`;
    correctAnswer = highest.name;
    options = candidates.map(c => c.name);
    imageUrl = highest.sprite || "/logo.png";
  }
  else if (qType === 2) {
    // Dual Type Query
    const wrong = getWrongOptions(p => p.types.join(",") !== target.types.join(","), 3);
    if (normalizedMode === "type") {
      questionText = `Identify this Pokémon! It has the exact Dual Types: [${target.types.join(" / ").toUpperCase()}]`;
    } else {
      questionText = `Which of these Pokémon has the exact Dual Types: [${target.types.join(" / ").toUpperCase()}]?`;
    }
    options = [correctAnswer, ...wrong];
  }
  else {
    // Generation Query
    const wrong = getWrongOptions(p => p.generation !== target.generation, 3);
    if (normalizedMode === "type") {
      questionText = `Identify this Generation ${target.generation} Pokémon!`;
    } else {
      questionText = `Which of these Pokémon belongs to Generation ${target.generation}?`;
    }
    options = [correctAnswer, ...wrong];
  }

  // Shuffle multiple choices
  options = [...options].sort(() => 0.5 - Math.random());

  return {
    questionText,
    correctAnswer,
    options,
    silhouette,
    imageUrl,
    targetPokemon: target
  };
}

export default function PokeQuiz() {
  const [gameState, setGameState] = useState("idle"); // 'idle', 'active', 'ended'
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  
  // Questions tracking
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  
  // Interactive options states
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealMode, setRevealMode] = useState(false); // Shows true sprites and option flags
  const [feedbackEffect, setFeedbackEffect] = useState(null); // { text, color }
  const [quizMode, setQuizMode] = useState("mcq"); // 'mcq' or 'type'
  const [searchQuery, setSearchQuery] = useState("");
  
  // Highscore tracking
  const [highScore, setHighScore] = useState(0);
  const [newHighScoreSet, setNewHighScoreSet] = useState(false);

  const gameTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const quizModeRef = useRef(quizMode);
  const scoreRef = useRef(score);

  // Sync refs with state to prevent stale closures in async timeouts / loop callbacks
  useEffect(() => {
    quizModeRef.current = quizMode;
  }, [quizMode]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load HighScore from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem("pokequiz_highscore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Compute Autocomplete matching species list for Type-In mode
  const autocompleteList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const starts = pokemonDataset.filter(p => p.name.startsWith(q));
    const contains = pokemonDataset.filter(p => !p.name.startsWith(q) && p.name.includes(q));
    return [...starts, ...contains].slice(0, 5); // show top 5 candidates
  }, [searchQuery]);

  // Fetch new question
  const nextQuestion = useCallback(() => {
    const q = generateQuestion(pokemonDataset, quizModeRef.current);
    setCurrentQuestion(q);
    setSelectedOption(null);
    setRevealMode(false);
  }, []);

  // Initialize Quiz Game Run
  const startQuiz = () => {
    setGameState("active");
    setTimeLeft(60);
    setScore(0);
    setQuestionsAnswered(0);
    setCorrectCount(0);
    setWrongCount(0);
    setNewHighScoreSet(false);
    setSearchQuery("");
    nextQuestion();
  };

  // End Game Battle State
  const endQuiz = useCallback(() => {
    setGameState("ended");
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Compute HighScore
    const savedHighScore = parseInt(localStorage.getItem("pokequiz_highscore") || "0", 10);
    const finalScore = scoreRef.current;
    if (finalScore > savedHighScore) {
      localStorage.setItem("pokequiz_highscore", String(finalScore));
      setHighScore(finalScore);
      setNewHighScoreSet(true);
    }
  }, []);

  // Tick Timer Effect
  useEffect(() => {
    if (gameState === "active") {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(gameTimerRef.current);
            endQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [gameState, endQuiz]);

  // Option submission feedback
  const handleAnswerSubmit = (option) => {
    if (revealMode || !currentQuestion) return; // Block double submissions during feedback

    setSelectedOption(option);
    setRevealMode(true);
    setQuestionsAnswered(prev => prev + 1);

    const isCorrect = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

    const activeMode = quizModeRef.current;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      
      const ptsAdded = activeMode === "mcq" ? 5 : 10;
      const secAdded = activeMode === "mcq" ? 1 : 3;
      
      setScore(prev => prev + ptsAdded);
      setTimeLeft(prev => prev + secAdded);
      
      // Floating time/score splash feedback
      setFeedbackEffect({ text: `+${ptsAdded} Pts  /  +${secAdded} Sec ⚡`, color: "text-emerald-500 animate-pulse" });
    } else {
      setWrongCount(prev => prev + 1);
      
      const ptsSubbed = activeMode === "mcq" ? 2 : 5;
      const secSubbed = activeMode === "mcq" ? 5 : 2;
      
      setScore(prev => Math.max(0, prev - ptsSubbed)); // Score cannot go negative
      setTimeLeft(prev => Math.max(0, prev - secSubbed));

      setFeedbackEffect({ text: `-${ptsSubbed} Pts  /  -${secSubbed} Sec 💔`, color: "text-red-500 animate-bounce" });
    }

    // Trigger feedback delay
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackEffect(null);
      setSearchQuery(""); // Reset search query inside Type-In mode
      nextQuestion();
    }, 1200); // 1.2 seconds feedback to fully appreciate silhouette reveal
  };

  // Accuracy calculation helper
  const accuracyPercent = useMemo(() => {
    if (questionsAnswered === 0) return 0;
    return Math.round((correctCount / questionsAnswered) * 100);
  }, [correctCount, questionsAnswered]);

  // Share results to clipboard
  const copyShareResults = () => {
    let text = `⚡ PokéQuiz - Fastest Finger Blitz! ⚡\n`;
    text += `Score: ${score} Pts 🏆 | Accuracy: ${accuracyPercent}% 📊\n`;
    text += `Correct answers: ${correctCount}/${questionsAnswered} 🟩\n`;
    text += `Accuracy rating: ${accuracyPercent >= 80 ? '🔥 Pokémon master!' : accuracyPercent >= 50 ? '🥈 Gym Leader' : '🥉 Trainer'}\n\n`;
    text += `Play Pokédex Battles!`;

    try {
      navigator.clipboard.writeText(text);
      alert("Score Sheet copied to clipboard! Share it! 🟩🚀");
    } catch {
      alert("Failed to write clipboard. Copy manually:\n\n" + text);
    }
  };

  // Clean feedback timers
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <BackgroundCarousel />
      <div className="container mx-auto px-4 py-8 mt-20 max-w-2xl min-h-screen pb-24">
        
        {/* Game Title Header */}
        <div className="text-center mb-6 relative select-none">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
            <FaBolt className="text-amber-500 animate-pulse" /> Fastest Finger Blitz
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-semibold mt-1">
            Test your Pok&eacute;dex instincts against the clock in this rapid-fire trivia quiz!
          </p>
        </div>

        {/* 1. START SCREEN */}
        {gameState === "idle" && (
          <div className="bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center animate-scale-up">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow text-4xl shadow-md">
              ⚡
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              Trainer Arena Entry
            </h2>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
              How fast can you identify Pokémon characteristics? Select your preferred blitz mode, check the dynamic rules, and enter the arena:
            </p>

            {/* Premium Mode Segmented Selector */}
            <div className="flex rounded-2xl overflow-hidden shadow-inner border border-black/5 dark:border-white/5 max-w-xs sm:max-w-sm mx-auto mb-6 bg-gray-200/50 dark:bg-black/20 p-1">
              <button
                onClick={() => setQuizMode("mcq")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-xl cursor-pointer ${
                  quizMode === 'mcq' 
                    ? 'bg-red-500 text-white shadow-md font-black' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                MCQ Blitz
              </button>
              <button
                onClick={() => setQuizMode("type")}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-xl cursor-pointer ${
                  quizMode === 'type' 
                    ? 'bg-red-500 text-white shadow-md font-black' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                Type-In Arena
              </button>
            </div>

            {/* Highscore HUD Banner */}
            {highScore > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 max-w-sm mx-auto mb-6 flex justify-between items-center text-left">
                <div className="flex items-center gap-2.5">
                  <FaTrophy className="text-amber-500 text-xl" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">All-Time High Score</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Record</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-amber-500 drop-shadow-sm">{highScore} <span className="text-xs font-semibold uppercase">Pts</span></span>
              </div>
            )}

            {/* Game Rules Card */}
            <div className="bg-black/5 dark:bg-black/35 border border-black/5 dark:border-white/5 rounded-2xl p-5 mb-8 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 space-y-3 shadow-inner">
              <h3 className="font-extrabold uppercase text-[10px] tracking-widest text-red-500 border-b border-black/5 dark:border-white/5 pb-1">
                {quizMode === 'mcq' ? 'MCQ Blitz Rules' : 'Type-In Arena Rules'}
              </h3>
              <div className="flex gap-2 items-start">
                <span className="text-red-500">⏱️</span>
                <p>Initial time limit is exactly **60 seconds**. Time counts down continuously!</p>
              </div>
              
              {quizMode === 'mcq' ? (
                <>
                  <div className="flex gap-2 items-start">
                    <span className="text-emerald-500">🟩</span>
                    <p>Correct answer grants <strong className="text-emerald-600 dark:text-emerald-400">+5 Points</strong> and adds <strong className="text-emerald-600 dark:text-emerald-400">+1 Second</strong> to your clock!</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-red-500">🟥</span>
                    <p>Wrong guess deducts <strong className="text-red-500">-2 Points</strong> and reduces your clock by <strong className="text-red-500">-5 Seconds</strong>!</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2 items-start">
                    <span className="text-emerald-500">🟩</span>
                    <p>Correct answer grants <strong className="text-emerald-600 dark:text-emerald-400">+10 Points</strong> and adds <strong className="text-emerald-600 dark:text-emerald-400">+3 Seconds</strong> to your clock!</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <span className="text-red-500">🟥</span>
                    <p>Wrong guess deducts <strong className="text-red-500">-5 Points</strong> and reduces your clock by <strong className="text-red-500">-2 Seconds</strong>!</p>
                  </div>
                </>
              )}
              
              <div className="flex gap-2 items-start">
                <span className="text-amber-500">✨</span>
                <p>Features mystery <strong className="text-amber-500">glowing white silhouettes</strong> across all questions!</p>
              </div>
            </div>

            <button
              onClick={startQuiz}
              className="w-full sm:w-64 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mx-auto text-sm"
            >
              <FaPlay /> Start Blitz Battle
            </button>
          </div>
        )}

        {/* 2. ACTIVE QUIZ INTERFACE */}
        {gameState === "active" && currentQuestion && (
          <div className="bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative animate-scale-up">
            
            {/* Top HUD Status Row */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/5 dark:border-white/5 select-none">
              
              {/* Score display */}
              <div className="flex items-center gap-2">
                <FaMedal className="text-amber-500 text-lg" />
                <div className="text-left leading-none">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Blitz Score</span>
                  <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{score} Pts</p>
                </div>
              </div>

              {/* Progress Count & Stop Button */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 font-bold">
                  Q: #{questionsAnswered + 1}
                </span>
                <button
                  onClick={endQuiz}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all cursor-pointer shadow-sm uppercase tracking-wider font-mono"
                >
                  🛑 Stop
                </button>
              </div>

              {/* Countdown Timer with pulsation */}
              <div className="flex items-center gap-2.5">
                <FaClock className={`text-xl transition-all ${timeLeft <= 10 ? 'text-red-500 animate-ping' : 'text-gray-400'}`} />
                <div className="text-right leading-none">
                  <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Clock Left</span>
                  <p className={`text-xl font-black mt-0.5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse font-mono' : 'text-gray-900 dark:text-white'}`}>
                    {timeLeft}s
                  </p>
                </div>
              </div>
            </div>

            {/* Time / Score Floating Feedback Splash */}
            {feedbackEffect && (
              <div className="absolute top-16 left-0 w-full text-center z-40 pointer-events-none select-none">
                <span className={`px-4 py-1.5 rounded-full bg-white/95 dark:bg-gray-900/95 border border-black/5 dark:border-white/10 text-xs font-black shadow-lg ${feedbackEffect.color} animate-bounce inline-block`}>
                  {feedbackEffect.text}
                </span>
              </div>
            )}

            {/* Main Question Silhouette/Artwork Card */}
            <div className="bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-3xl p-5 mb-6 text-center shadow-inner relative flex flex-col items-center overflow-hidden">
              
              {/* Animated scanning line when revealing target */}
              {revealMode && (
                <div className="absolute left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-scan-laser pointer-events-none z-30" />
              )}
              
              {/* Silhouette panel */}
              <div className="relative w-44 h-44 mb-4 select-none">
                <Image
                  src={currentQuestion.imageUrl}
                  alt="Mystery Pokémon"
                  fill
                  sizes="(max-width: 176px) 100vw, 176px"
                  className={`object-contain transition-all duration-500 p-2 ${
                    currentQuestion.silhouette && !revealMode
                      ? 'opacity-90 scale-100'
                      : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.2)] scale-102'
                  }`}
                  style={{
                    filter: currentQuestion.silhouette && !revealMode 
                      ? 'brightness(0) invert(1) drop-shadow(0 0 6px rgba(255, 255, 255, 0.45))' 
                      : 'none'
                  }}
                  priority
                />
              </div>

              {/* Question Text */}
              <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white max-w-md">
                {currentQuestion.questionText}
              </h3>
              
              {/* Revealing overlay */}
              {revealMode && (
                <p className="text-emerald-500 font-mono text-[10px] font-extrabold uppercase mt-2 bg-emerald-500/10 px-2.5 py-0.5 rounded-md tracking-wider animate-pulse">
                  It's {currentQuestion.correctAnswer.toUpperCase()}!
                </p>
              )}
            </div>

            {/* DYNAMIC ANSWERING FORMAT BLOCK */}
            {quizMode === 'type' ? (
              // TYPE-IN AUTOCPLETE FORMAT
              <div className="relative w-full max-w-md mx-auto select-none mt-2 mb-4">
                <div className="relative z-30">
                  <input
                    type="text"
                    disabled={revealMode}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={revealMode ? "Analyzing guess..." : "Type Pokémon name..."}
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner ${
                      revealMode 
                        ? 'border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-80' 
                        : selectedOption
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                    autoComplete="off"
                  />
                  
                  {/* Suggestions list overlay */}
                  {searchQuery.trim().length > 0 && !revealMode && (
                    <ul className="absolute left-0 top-full mt-2 w-full max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/95 dark:bg-gray-900/95 shadow-2xl divide-y divide-black/5 dark:divide-white/5 z-50 backdrop-blur-xl animate-fade-in">
                      {autocompleteList.length > 0 ? (
                        autocompleteList.map((p) => (
                          <li
                            key={p.id}
                            onClick={() => handleAnswerSubmit(p.name)}
                            className="px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 text-sm font-black capitalize transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-8 h-8 bg-white/20 dark:bg-black/10 border border-white/30 dark:border-white/10 rounded-full flex items-center justify-center p-0.5">
                                <Image 
                                  src={p.sprite || '/logo.png'} 
                                  alt={p.name} 
                                  fill 
                                  sizes="(max-width: 32px) 100vw, 32px"
                                  className="object-contain" 
                                />
                              </div>
                              <span className="text-gray-900 dark:text-white capitalize truncate max-w-[170px]">{p.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">#{String(p.id).padStart(3, '0')}</span>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-4 text-center text-xs font-semibold text-gray-500 leading-relaxed">
                          No Pokémon found.
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Submit Feedback indicators in Type mode */}
                {revealMode && (
                  <div className={`mt-3 p-3.5 rounded-2xl border text-xs font-black text-center animate-scale-up ${
                    selectedOption.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 animate-pulse'
                      : 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400'
                  }`}>
                    {selectedOption.toLowerCase() === currentQuestion.correctAnswer.toLowerCase() ? (
                      <span className="flex items-center justify-center gap-1.5 uppercase tracking-wide font-mono">
                        <FaCheck /> Correct! Magnificent species recall!
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1 font-mono">
                        <span className="flex items-center justify-center gap-1.5 uppercase tracking-wide">
                          <FaTimes /> Incorrect! You typed: "{selectedOption}"
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block">
                          Mystery Pokémon was: <strong className="capitalize text-emerald-500">{currentQuestion.correctAnswer}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // MCQ BUTTONS FORMAT
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 select-none">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
                  
                  // Button Visual Theme committing during reveal phase
                  let btnStyles = 'bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/5 hover:bg-white/30 dark:hover:bg-black/30 hover:scale-[1.01] text-gray-800 dark:text-gray-200';
                  
                  if (revealMode) {
                    if (isCorrectOption) {
                      btnStyles = 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-md font-black animate-pulse';
                    } else if (isSelected) {
                      btnStyles = 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 ring-2 ring-red-500/20 shadow-md opacity-80';
                    } else {
                      btnStyles = 'opacity-30 border-black/5 dark:border-white/5 bg-transparent text-gray-400 dark:text-gray-600';
                    }
                  }

                  return (
                    <button
                      key={`opt-${idx}`}
                      disabled={revealMode}
                      onClick={() => handleAnswerSubmit(option)}
                      className={`py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-extrabold border text-left transition-all duration-300 flex items-center justify-between shadow-sm cursor-pointer ${btnStyles}`}
                    >
                      <span className="capitalize">{option}</span>
                      
                      {revealMode && (
                        <span className="text-sm">
                          {isCorrectOption ? (
                            <FaCheck className="text-emerald-500 animate-scale-up" />
                          ) : isSelected ? (
                            <FaTimes className="text-red-500" />
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Live Stats Explorer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 select-none px-1 border-t border-black/5 dark:border-white/5 pt-3">
              <span>ACCURACY: {accuracyPercent}%</span>
              <span>CORRECT: {correctCount}</span>
              <span>WRONG: {wrongCount}</span>
            </div>
          </div>
        )}

        {/* 3. GAME OVER SCREEN */}
        {gameState === "ended" && (
          <div className="bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center animate-scale-up select-none">
            
            {/* Trophy Showcase */}
            <div className={`w-18 h-18 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-md ${newHighScoreSet ? 'animate-bounce-slow border-2 border-amber-500' : 'animate-pulse-slow'}`}>
              <FaTrophy className={newHighScoreSet ? 'text-amber-500' : 'text-gray-400'} />
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Time Expired! ⏱️
            </h2>
            <p className="text-gray-700 dark:text-gray-300 font-semibold mt-1.5 text-sm">
              The clock reached 0! Excellent battle, Trainer!
            </p>

            {/* Record congratulations */}
            {newHighScoreSet && (
              <span className="inline-block mt-3 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                🏆 NEW HIGH SCORE RECORD! 🏆
              </span>
            )}

            {/* Score Breakdown logs */}
            <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 p-5 rounded-2xl my-6 text-xs font-semibold text-gray-700 dark:text-gray-300 text-left space-y-3 shadow-inner">
              <div className="flex justify-between">
                <span>Final Blitz Score:</span>
                <span className="text-amber-500 font-extrabold text-sm">{score} Pts</span>
              </div>
              <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-2">
                <span>Total Questions Answered:</span>
                <span className="text-gray-900 dark:text-white font-extrabold">{questionsAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span>Correct Answers (Accuracy):</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">{correctCount} ({accuracyPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Wrong Guesses:</span>
                <span className="text-red-500 font-extrabold">{wrongCount}</span>
              </div>
              <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-2.5 font-bold text-[10px] uppercase text-gray-400">
                <span>Personal Highscore Record:</span>
                <span className="text-gray-700 dark:text-gray-200 font-black">{highScore} Pts</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={copyShareResults}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/10 cursor-pointer text-xs uppercase tracking-wider font-mono"
              >
                <FaShareAlt /> Share Score Sheet
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={startQuiz}
                  className="py-2.5 bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/20 transition-all text-xs cursor-pointer font-mono"
                >
                  Battle Again
                </button>
                <Link
                  href="/pokedoku"
                  className="py-2.5 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-300 font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/15 transition-all text-xs flex items-center justify-center gap-1 cursor-pointer font-mono"
                >
                  <FaGamepad /> PokéGrid
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
