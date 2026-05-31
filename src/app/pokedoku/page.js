"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaGamepad, FaUndo, FaShareAlt, FaInfoCircle, FaTrophy,
  FaRegQuestionCircle, FaCheck, FaTimes, FaTimesCircle, FaChevronRight
} from "react-icons/fa";
import ErrorBoundary from "@/components/ErrorBoundary";
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

// Seed-based pseudo-random generator for identical Daily grids
function seedRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Category helper matcher
function matchesCategory(pokemon, category) {
  if (!pokemon || !category) return false;
  if (category.type === 'type') {
    return pokemon.types.includes(category.value);
  }
  if (category.type === 'generation') {
    return pokemon.generation === category.value;
  }
  if (category.type === 'special') {
    switch (category.value) {
      case 'legendary': return pokemon.is_legendary || pokemon.is_mythical;
      case 'fossil': return pokemon.is_fossil;
      case 'pseudo': return pokemon.is_pseudo;
      case 'dual_type': return pokemon.types.length === 2;
      case 'single_type': return pokemon.types.length === 1;
      default: return false;
    }
  }
  return false;
}

// Grid generator ensuring a 100% solvable puzzle
function generateSolvableGrid(seed = null, customFilters = null) {
  const isDaily = seed !== null;
  let currentSeed = isDaily ? seed : Math.random() * 100000;

  function getRandomElement(arr) {
    const r = isDaily ? seedRandom(currentSeed++) : Math.random();
    return arr[Math.floor(r * arr.length)];
  }

  // Use custom filters if provided, otherwise default to all categories
  // We sort these arrays stably to guarantee identical grid outcomes across clients regardless of UI toggle ordering.
  const types = customFilters && Array.isArray(customFilters.types)
    ? [...customFilters.types].sort((a, b) => ALL_TYPES_LIST.indexOf(a) - ALL_TYPES_LIST.indexOf(b))
    : ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

  const gens = customFilters && Array.isArray(customFilters.gens)
    ? [...customFilters.gens].sort((a, b) => a - b)
    : [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const specials = customFilters && Array.isArray(customFilters.specials)
    ? [...customFilters.specials].sort((a, b) => ALL_SPECIALS_LIST.indexOf(a) - ALL_SPECIALS_LIST.indexOf(b))
    : ['legendary', 'fossil', 'dual_type', 'single_type'];

  const allCategories = [];
  types.forEach(t => allCategories.push({ type: 'type', value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));
  gens.forEach(g => allCategories.push({ type: 'generation', value: g, label: `Gen ${g}` }));
  specials.forEach(s => {
    let label = '';
    if (s === 'legendary') label = 'Legendary';
    else if (s === 'fossil') label = 'Fossil';
    else if (s === 'pseudo') label = 'Pseudo-Lgd';
    else if (s === 'dual_type') label = 'Dual Type';
    else if (s === 'single_type') label = 'Single Type';
    allCategories.push({ type: 'special', value: s, label });
  });

  let attempts = 0;
  while (attempts < 1000) {
    attempts++;

    // Select 3 random unique row categories
    const rowCats = [];
    while (rowCats.length < 3) {
      const cat = getRandomElement(allCategories);
      if (!rowCats.some(r => r.value === cat.value && r.type === cat.type)) {
        rowCats.push(cat);
      }
    }

    // Select 3 random unique col categories that don't overlap with rows
    const colCats = [];
    while (colCats.length < 3) {
      const cat = getRandomElement(allCategories);
      if (!rowCats.some(r => r.value === cat.value && r.type === cat.type) &&
        !colCats.some(c => c.value === cat.value && c.type === cat.type)) {
        colCats.push(cat);
      }
    }

    let isSolvable = true;
    const gridCells = [];

    for (let r = 0; r < 3; r++) {
      gridCells[r] = [];
      for (let c = 0; c < 3; c++) {
        const rowCat = rowCats[r];
        const colCat = colCats[c];

        // Filter valid solutions
        const matches = (pokemonDataset || []).filter(p =>
          matchesCategory(p, rowCat) && matchesCategory(p, colCat)
        );

        if (matches.length < 3) {
          isSolvable = false;
          break;
        }

        gridCells[r][c] = {
          rowCat,
          colCat,
          solutionsCount: matches.length,
          solutions: matches.map(m => m.name)
        };
      }
      if (!isSolvable) break;
    }

    if (isSolvable) {
      return {
        rows: rowCats,
        cols: colCats,
        cells: gridCells
      };
    }
  }

  // Fallback grid
  return {
    rows: [
      { type: 'type', value: 'fire', label: 'Fire' },
      { type: 'generation', value: 1, label: 'Gen 1' },
      { type: 'special', value: 'legendary', label: 'Legendary' }
    ],
    cols: [
      { type: 'type', value: 'flying', label: 'Flying' },
      { type: 'type', value: 'dragon', label: 'Dragon' },
      { type: 'generation', value: 3, label: 'Gen 3' }
    ],
    cells: []
  };
}

// ==========================================
// ARENA CHALLENGE LOBBY CODE COMPRESSION SYSTEM
// ==========================================
const ALL_TYPES_LIST = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
const ALL_SPECIALS_LIST = ['legendary', 'fossil', 'dual_type', 'single_type'];

function encodeRoomCode(seed, gens, types, specials) {
  let mask = 0;

  // Gens: bits 0-8
  gens.forEach(g => {
    mask |= (1 << (g - 1));
  });

  // Types: bits 9-26
  types.forEach(t => {
    const idx = ALL_TYPES_LIST.indexOf(t);
    if (idx !== -1) {
      mask |= (1 << (9 + idx));
    }
  });

  // Specials: bits 27-30
  specials.forEach(s => {
    const idx = ALL_SPECIALS_LIST.indexOf(s);
    if (idx !== -1) {
      mask |= (1 << (27 + idx));
    }
  });

  const maskHex = mask.toString(16).toUpperCase();
  const seedHex = Math.floor(seed).toString(16).toUpperCase();
  return `ROOM-${maskHex}-${seedHex}`;
}

function decodeRoomCode(code) {
  try {
    const cleanCode = code.trim().toUpperCase().replace("ROOM-", "");
    const parts = cleanCode.split("-");
    if (parts.length !== 2) return null;

    const mask = parseInt(parts[0], 16);
    const seed = parseInt(parts[1], 16);
    if (isNaN(mask) || isNaN(seed)) return null;

    // Deconstruct bitmask
    const gens = [];
    for (let g = 1; g <= 9; g++) {
      if ((mask & (1 << (g - 1))) !== 0) {
        gens.push(g);
      }
    }

    const types = [];
    ALL_TYPES_LIST.forEach((t, idx) => {
      if ((mask & (1 << (9 + idx))) !== 0) {
        types.push(t);
      }
    });

    const specials = [];
    ALL_SPECIALS_LIST.forEach((s, idx) => {
      if ((mask & (1 << (27 + idx))) !== 0) {
        specials.push(s);
      }
    });

    if (gens.length + types.length + specials.length < 6) return null;

    return {
      gens,
      types,
      specials,
      seed
    };
  } catch {
    return null;
  }
}

export default function Pokedoku() {
  const [gameMode, setGameMode] = useState("daily"); // 'daily' or 'unlimited'
  const [grid, setGrid] = useState(null);
  const [correctGuesses, setCorrectGuesses] = useState({}); // key: 'r-c', value: pokemon object
  const [guessesLeft, setGuessesLeft] = useState(9);
  const [guessesUsed, setGuessesUsed] = useState(0);
  const [guessesHistory, setGuessesHistory] = useState([]); // Array of emoji grid markers

  // Custom interactive animations during creation
  const [isGenerating, setIsGenerating] = useState(true);
  const [generatingStep, setGeneratingStep] = useState(0);

  // Modals & Searching
  const [selectedCell, setSelectedCell] = useState(null); // { r, c }
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverStatus, setGameOverStatus] = useState("victory"); // 'victory' or 'defeat'
  const [activeCellSolutions, setActiveCellSolutions] = useState(null); // For solutions review
  const [isSurrendered, setIsSurrendered] = useState(false);
  const [showSurrenderModal, setShowSurrenderModal] = useState(false);
  const [showRepeatWarning, setShowRepeatWarning] = useState(false);
  const [warnedPokemon, setWarnedPokemon] = useState("");

  // Unlimited Arena Customizer states
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [allowedGens, setAllowedGens] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [allowedTypes, setAllowedTypes] = useState(['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy']);
  const [allowedSpecials, setAllowedSpecials] = useState(['legendary', 'fossil', 'dual_type', 'single_type']);

  // Challenge room & duel states
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [challengeRoomCode, setChallengeRoomCode] = useState("");
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [currentTimeElapsed, setCurrentTimeElapsed] = useState("0s");
  const [showHostSuccessModal, setShowHostSuccessModal] = useState(false);
  const [customToast, setCustomToast] = useState(null);

  const [playerRole, setPlayerRole] = useState("host"); // 'host' or 'challenger'
  const [currentTurn, setCurrentTurn] = useState("host"); // 'host' or 'challenger'

  const showToast = useCallback((message, type = 'info', title = '') => {
    setCustomToast({ message, type, title });
    if (type !== 'error') {
      setTimeout(() => {
        setCustomToast(prev => {
          if (prev && prev.message === message) return null;
          return prev;
        });
      }, 3000);
    }
  }, []);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const generateIntervalRef = useRef(null);
  const customFiltersRef = useRef(null);
  const socketRef = useRef(null);

  // Toggle filter vectors with safety checks to maintain 6-category minimum threshold
  const toggleGenFilter = (gen) => {
    setAllowedGens(prev => {
      if (prev.includes(gen)) {
        const activeCount = prev.length - 1 + allowedTypes.length + allowedSpecials.length;
        if (activeCount < 6) {
          showToast("You must keep at least 6 active categories across all sections to ensure solvable 3x3 grids!", 'error', "Category Threshold");
          return prev;
        }
        return prev.filter(g => g !== gen);
      } else {
        return [...prev, gen].sort((a, b) => a - b);
      }
    });
  };

  const toggleTypeFilter = (type) => {
    setAllowedTypes(prev => {
      if (prev.includes(type)) {
        const activeCount = allowedGens.length + prev.length - 1 + allowedSpecials.length;
        if (activeCount < 6) {
          showToast("You must keep at least 6 active categories across all sections to ensure solvable 3x3 grids!", 'error', "Category Threshold");
          return prev;
        }
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const toggleSpecialFilter = (special) => {
    setAllowedSpecials(prev => {
      if (prev.includes(special)) {
        const activeCount = allowedGens.length + allowedTypes.length + prev.length - 1;
        if (activeCount < 6) {
          showToast("You must keep at least 6 active categories across all sections to ensure solvable 3x3 grids!", 'error', "Category Threshold");
          return prev;
        }
        return prev.filter(s => s !== special);
      } else {
        return [...prev, special];
      }
    });
  };

  // Initialize Game Grid with simulated progressive creation logs
  const initGame = useCallback((mode, customFilters = null, customSeed = null) => {
    if (generateIntervalRef.current) {
      clearInterval(generateIntervalRef.current);
    }

    setIsGenerating(true);
    setGeneratingStep(0);
    setIsSurrendered(false); // Reset surrender state
    setShowSurrenderModal(false); // Reset surrender modal state

    let seed = customSeed;
    if (seed === null) {
      if (mode === "daily") {
        const today = new Date();
        seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      }
    }
    const newGrid = generateSolvableGrid(seed, customFilters || customFiltersRef.current);
    setGrid(newGrid); // Set immediately so loading screen can read row/col categories!

    let currentStep = 0;
    generateIntervalRef.current = setInterval(() => {
      currentStep++;
      if (currentStep < 5) {
        setGeneratingStep(currentStep);
      } else {
        if (generateIntervalRef.current) {
          clearInterval(generateIntervalRef.current);
        }
        setCorrectGuesses({});
        setGuessesLeft(9);
        setGuessesUsed(0);
        setGuessesHistory(Array(9).fill(null));
        setShowGameOver(false);
        setSelectedCell(null);
        setSearchQuery("");
        setActiveCellSolutions(null);
        setIsGenerating(false);
        setStartTime(Date.now()); // Record start time when grid synthesize finishes
        setEndTime(null);
      }
    }, 300); // 300ms steps = 1.5 seconds total progressive creation animation
  }, []);

  // Trigger custom surrender confirmation modal
  const surrenderGame = () => {
    if (Object.keys(correctGuesses).length === 9) return; // Already finished successfully
    setShowSurrenderModal(true);
  };

  // Confirm surrender action from modal
  const confirmSurrender = () => {
    setShowSurrenderModal(false);
    setIsSurrendered(true);
    setGuessesLeft(0);
    setGameOverStatus("defeat");
    setShowGameOver(true);
    setEndTime(Date.now()); // Stop timer

    if (isChallengeActive && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        roomCode: challengeRoomCode,
        type: "surrender",
        role: playerRole
      }));
    }
  };

  useEffect(() => {
    if (gameMode === "daily") {
      initGame("daily");
    } else {
      initGame("unlimited", customFiltersRef.current);
    }
    return () => {
      if (generateIntervalRef.current) {
        clearInterval(generateIntervalRef.current);
      }
    };
  }, [gameMode, initGame]);

  // Click outside listener for search autocomplete
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSelectedCell(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Read Room Code URL Parameters on mount to automatically join Challenge Duel
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const room = urlParams.get("room");
      if (room) {
        const decoded = decodeRoomCode(room);
        if (decoded) {
          // Sync allowed vectors
          setAllowedGens(decoded.gens);
          setAllowedTypes(decoded.types);
          setAllowedSpecials(decoded.specials);
          customFiltersRef.current = { gens: decoded.gens, types: decoded.types, specials: decoded.specials };

          setChallengeRoomCode(room.toUpperCase());
          setIsChallengeActive(true);
          setPlayerRole("challenger");
          setCurrentTurn("host"); // Host always goes first
          setGameMode("unlimited");

          // Synthesize grid immediately using the custom room's exact seed
          initGame("unlimited", decoded, decoded.seed);
        } else {
          showToast("The battle room link was corrupt or expired!", 'error', "Corrupt Battle Link");
        }
      }
    }
  }, [initGame]);

  // Real-time Shared-State Multiplayer Room Broker Connection
  useEffect(() => {
    if (!isChallengeActive || !challengeRoomCode) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      return;
    }

    let isDestroyed = false;
    let reconnectTimeout = null;
    let reconnectCount = 0;
    const maxReconnectCount = 8;

    function connect() {
      if (isDestroyed) return;

      // Connect to our self-hosted local WebSocket relay. Rooms are isolated in-memory by roomCode.
      // Falls back to the public SocketsBay relay if running without the custom server (dev:relay).
      const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsHost = typeof window !== "undefined" ? window.location.host : "localhost:3000";
      const wsUrl = `${wsProtocol}//${wsHost}/api/relay`;
      console.log(`[Multiplayer] Connecting to Local Relay (Attempt ${reconnectCount + 1}/${maxReconnectCount}): ${wsUrl}`);

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (isDestroyed) {
          socket.close();
          return;
        }
        reconnectCount = 0; // Reset reconnect count on successful connection
        console.log("WebSocket connected to shared duel broker via SocketsBay");
        // Let other peers in room know we have connected
        socket.send(JSON.stringify({
          roomCode: challengeRoomCode,
          type: "join",
          role: playerRole
        }));
      };

      socket.onmessage = (event) => {
        if (isDestroyed) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.roomCode !== challengeRoomCode) return; // Defensive room filter

          // Guard: since our local relay echoes messages to everyone, ignore messages we sent ourselves
          if (msg.senderRole && msg.senderRole === playerRole) return;

          if (msg.type === "join") {
            showToast("Opponent Trainer has entered the arena! Turn order: Host first!", 'success', "Player Joined");
          } else if (msg.type === "move") {
            const { cell, pokemon, isCorrect, guessesLeft: nextGuessesLeft, senderRole } = msg;
            const [r, c] = cell.split("-").map(Number);
            const historyIdx = r * 3 + c;

            if (isCorrect) {
              setCorrectGuesses(prev => ({
                ...prev,
                [cell]: pokemon
              }));
              setGuessesHistory(prev => {
                const next = [...prev];
                next[historyIdx] = "🟩";
                return next;
              });
              setGuessesUsed(prev => prev + 1);
              showToast(`Opponent correctly solved Cell (${r + 1}, ${c + 1}) with ${pokemon.name}!`, 'success', "Opponent Score");
            } else {
              setGuessesHistory(prev => {
                const next = [...prev];
                next[historyIdx] = "🟥";
                return next;
              });
              setGuessesLeft(nextGuessesLeft);
              setGuessesUsed(prev => prev + 1);
              showToast(`Opponent missed Cell (${r + 1}, ${c + 1})!`, 'error', "Opponent Missed");

              // Shake cell
              const cellElement = document.getElementById(`cell-${r}-${c}`);
              if (cellElement) {
                cellElement.classList.add("animate-bounce");
                setTimeout(() => cellElement.classList.remove("animate-bounce"), 800);
              }
            }

            // It's now OUR turn — set to the role that is NOT the sender's role
            setCurrentTurn(playerRole);
          } else if (msg.type === "skip") {
            showToast("Opponent skipped their turn! It is now your turn.", 'info', "Turn Transferred");
            setCurrentTurn(playerRole);
          } else if (msg.type === "surrender") {
            showToast("Opponent has surrendered the match! Solutions revealed.", 'error', "Opponent Surrendered");
            setIsSurrendered(true);
            setGuessesLeft(0);
            setGameOverStatus("defeat");
            setShowGameOver(true);
            setEndTime(Date.now());
          }
        } catch (err) {
          console.error("Error reading WebSocket broadcast message:", err);
        }
      };

      socket.onerror = (err) => {
        // Just log a silent warning, do not invoke console.error to prevent unhandled test failures
        console.warn("WebSocket lobby connection reported an issue. Attempting graceful reconnect...");
      };

      socket.onclose = (event) => {
        if (isDestroyed) return;
        socketRef.current = null;

        if (reconnectCount < maxReconnectCount) {
          const delay = Math.min(1000 * (reconnectCount + 1), 5000);
          console.warn(`WebSocket connection closed. Retrying in ${delay}ms... (Reason: ${event.reason || 'none'})`);

          reconnectTimeout = setTimeout(() => {
            reconnectCount++;
            connect();
          }, delay);

          if (reconnectCount === 0) {
            showToast("Lobby connection interrupted. Trying to reconnect...", 'info', "Lobby Connection");
          }
        } else {
          showToast("Multiplayer Connection Failed: Please check your network and refresh.", 'error', "Lobby Error");
        }
      };
    }

    connect();

    return () => {
      isDestroyed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isChallengeActive, challengeRoomCode, playerRole, showToast]);

  const skipTurn = useCallback(() => {
    if (!isChallengeActive || currentTurn !== playerRole) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        roomCode: challengeRoomCode,
        type: "skip",
        role: playerRole
      }));
      setCurrentTurn(playerRole === "host" ? "challenger" : "host");
      showToast("You skipped your turn. Opponent's turn!", 'info', "Turn Skipped");
    }
  }, [isChallengeActive, currentTurn, playerRole, challengeRoomCode, showToast]);

  // Live timer tick for active Challenge Duels
  useEffect(() => {
    let interval = null;
    if (startTime && !endTime) {
      interval = setInterval(() => {
        const diffMs = Date.now() - startTime;
        const diffSec = Math.floor(diffMs / 1000);
        const min = Math.floor(diffSec / 60);
        const sec = diffSec % 60;
        setCurrentTimeElapsed(min > 0 ? `${min}m ${sec}s` : `${sec}s`);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, endTime]);

  // Exit duel room and reset URL state back to standard Unlimited mode
  const exitChallengeRoom = () => {
    setIsChallengeActive(false);
    setChallengeRoomCode("");
    setStartTime(null);
    setEndTime(null);
    customFiltersRef.current = null;
    if (typeof window !== "undefined") {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    initGame("unlimited");
  };

  // Convert elapsed play time into standard display string
  const timeElapsedString = useMemo(() => {
    if (!startTime) return "0s";
    const end = endTime || Date.now();
    const diffMs = end - startTime;
    const diffSec = Math.floor(diffMs / 1000);
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  }, [startTime, endTime]);

  // Keyboard navigation for search modal
  useEffect(() => {
    if (selectedCell && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [selectedCell]);

  // Compute Uniqueness / Rarity Score
  const rarityScore = useMemo(() => {
    let score = 0;
    Object.keys(correctGuesses).forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      if (grid && grid.cells[r]?.[c]) {
        const totalSolutions = grid.cells[r][c].solutionsCount;
        // Formula: Scarcity points (fewer solutions = more points)
        // Max 100 per cell, minimum 20
        const points = Math.max(20, 100 - Math.min(80, totalSolutions));
        score += points;
      }
    });
    return score;
  }, [correctGuesses, grid]);

  // Handle Autocomplete list matching
  const autocompleteList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const starts = pokemonDataset.filter(p => p.name.startsWith(q));
    const contains = pokemonDataset.filter(p => !p.name.startsWith(q) && p.name.includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [searchQuery]);

  // Set of all used Pokemon in this game (no repeating!)
  const usedPokemonNames = useMemo(() => {
    return new Set(Object.values(correctGuesses).map(p => p.name.toLowerCase()));
  }, [correctGuesses]);

  // Select Pokémon choice
  const selectPokemon = (pokemon) => {
    if (!selectedCell || !grid) return;
    const { r, c } = selectedCell;

    // 1) Verify no repeat Pokemon
    if (usedPokemonNames.has(pokemon.name.toLowerCase())) {
      setWarnedPokemon(pokemon.name);
      setShowRepeatWarning(true);
      return;
    }

    const rowCat = grid.rows[r];
    const colCat = grid.cols[c];
    const isCorrect = matchesCategory(pokemon, rowCat) && matchesCategory(pokemon, colCat);

    const historyIndex = r * 3 + c;
    const nextHistory = [...guessesHistory];

    if (isCorrect) {
      // SUCCESS
      const nextCorrect = { ...correctGuesses };
      nextCorrect[`${r}-${c}`] = pokemon;
      setCorrectGuesses(nextCorrect);

      nextHistory[historyIndex] = "🟩";
      setGuessesHistory(nextHistory);

      // Broadcast the successful move to the opponent
      if (isChallengeActive && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          roomCode: challengeRoomCode,
          type: "move",
          senderRole: playerRole,   // so receiver can ignore self-echoes
          cell: `${r}-${c}`,
          pokemon: pokemon,
          isCorrect: true,
          guessesLeft: guessesLeft,
          rarityScore: rarityScore
        }));
      }

      // Always switch the turn after making a move (even if socket is temporarily closed)
      if (isChallengeActive) {
        setCurrentTurn(playerRole === "host" ? "challenger" : "host");
      }

      // Check Victory Condition
      if (Object.keys(nextCorrect).length === 9) {
        setGameOverStatus("victory");
        setShowGameOver(true);
        setEndTime(Date.now()); // Stop timer
      }
    } else {
      // MISSED GUESS
      nextHistory[historyIndex] = "🟥"; // Missed / Failed Cell red box!
      setGuessesHistory(nextHistory);
      const nextGuessesLeft = guessesLeft - 1;
      setGuessesLeft(nextGuessesLeft);

      // Broadcast the missed move to the opponent
      if (isChallengeActive && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          roomCode: challengeRoomCode,
          type: "move",
          senderRole: playerRole,   // so receiver can ignore self-echoes
          cell: `${r}-${c}`,
          isCorrect: false,
          guessesLeft: nextGuessesLeft
        }));
      }

      // Always switch the turn after making a move (even if socket is temporarily closed)
      if (isChallengeActive) {
        setCurrentTurn(playerRole === "host" ? "challenger" : "host");
      }

      // Trigger cell shake
      const cellElement = document.getElementById(`cell-${r}-${c}`);
      if (cellElement) {
        cellElement.classList.add("animate-bounce");
        setTimeout(() => cellElement.classList.remove("animate-bounce"), 800);
      }

      // Check Defeat Condition (if no guesses left)
      if (guessesLeft <= 1) {
        setGameOverStatus("defeat");
        setShowGameOver(true);
        setEndTime(Date.now()); // Stop timer
      }
    }

    setGuessesUsed((prev) => prev + 1);
    setSelectedCell(null);
    setSearchQuery("");
  };

  // Generate Copyable Results Grid
  const copyShareGrid = () => {
    let text = "";
    if (isChallengeActive) {
      text += `⚔️ PokéGrid Arena Duel ⚔️\n`;
      text += `Room Code: ${challengeRoomCode}\n\n`;
      text += `🔵 Challenger Stats:\n`;
      text += `- Solve Score: ${rarityScore} Pts 🏆\n`;
      text += `- Cells Solved: ${Object.keys(correctGuesses).length}/9 🟩\n`;
      text += `- Guesses Spent: ${guessesUsed}/9\n`;
      text += `- Time Elapsed: ${timeElapsedString} ⏱️\n\n`;
      text += `Join the battle and try to beat my score:\n`;
      text += `${window.location.origin}${window.location.pathname}?room=${challengeRoomCode}\n`;
    } else {
      text += `PokéGrid Arena Battle (${gameMode.toUpperCase()}) 🧩\n`;
      text += `Correct: ${Object.keys(correctGuesses).length}/9 | Guesses Used: ${guessesUsed}/9\n`;
      text += `Rarity Score: ${rarityScore}/900 🏆\n\n`;
    }

    for (let r = 0; r < 3; r++) {
      let rowEmojis = "";
      for (let c = 0; c < 3; c++) {
        const marker = guessesHistory[r * 3 + c];
        rowEmojis += marker === "🟩" ? "🟩" : "⬜";
      }
      text += `${rowEmojis}\n`;
    }
    text += "\nPlay Pokédex Battles!";

    try {
      navigator.clipboard.writeText(text);
      showToast("Results Grid copied to Clipboard! Share it with your friends! 🟩🚀", 'success', "Copied Results");
    } catch {
      showToast("Failed to write to clipboard. Copy results manually!", 'error', "Clipboard Error");
    }
  };

  if (!grid) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <PokeLoader size={72} label="Constructing Solvable Battle Grid..." />
      </div>
    );
  }

  return (
    <>
      <BackgroundCarousel />
      <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl min-h-screen pb-24">

        {/* Game Title Headers */}
        <div className="text-center mb-6 relative">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
            <FaGamepad className="text-red-500 animate-pulse" /> PokeGrid Arena
          </h1>
          <p className="text-white dark:text-gray-300 font-semibold mt-1">
            Fill the 3x3 grid with Pokemon matching row and column conditions in exactly 9 guesses!
          </p>
        </div>

        {/* Mode Selector & Help bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/40 dark:bg-gray-950/40 backdrop-blur-md rounded-2xl border border-white/50 dark:border-white/5 p-4 mb-6 gap-4">
          <div className="flex rounded-xl overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
            <button
              onClick={() => setGameMode("daily")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${gameMode === 'daily' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200/50 dark:bg-black/20 text-white dark:text-gray-300 hover:bg-black/5'}`}
            >
              Daily Battle
            </button>
            <button
              onClick={() => setGameMode("unlimited")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${gameMode === 'unlimited' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-200/50 dark:bg-black/20 text-white dark:text-gray-300 hover:bg-black/5'}`}
            >
              Unlimited Arena
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1 text-sm font-bold text-white dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <FaInfoCircle /> Game Rules
            </button>
            {guessesLeft > 0 && !isSurrendered && Object.keys(correctGuesses).length < 9 && (
              <div className="flex gap-2">
                {isChallengeActive && currentTurn === playerRole && (
                  <button
                    onClick={skipTurn}
                    className="flex items-center gap-1 text-sm font-bold bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white px-4 py-2 rounded-xl border border-indigo-500/20 hover:border-indigo-500 transition-all shadow-sm cursor-pointer hover:scale-102"
                  >
                    ⏳ Skip Turn
                  </button>
                )}
                <button
                  onClick={surrenderGame}
                  className="flex items-center gap-1 text-sm font-bold bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500 transition-all shadow-sm cursor-pointer hover:scale-102"
                >
                  🏳️ Surrender
                </button>
              </div>
            )}
            {gameMode === 'unlimited' && (
              <button
                onClick={() => {
                  if (isChallengeActive) {
                    const newSeed = Math.floor(Math.random() * 1000000);
                    const code = encodeRoomCode(newSeed, allowedGens, allowedTypes, allowedSpecials);
                    if (typeof window !== "undefined") {
                      const link = `${window.location.origin}${window.location.pathname}?room=${code}`;
                      window.history.replaceState({}, document.title, link);
                    }
                    setChallengeRoomCode(code);
                    initGame("unlimited", { gens: allowedGens, types: allowedTypes, specials: allowedSpecials }, newSeed);
                  } else {
                    initGame("unlimited");
                  }
                }}
                className="flex items-center gap-1 text-sm font-bold bg-white/50 dark:bg-white/10 px-4 py-2 rounded-xl border border-white/30 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-red-500 hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <FaUndo /> New Grid
              </button>
            )}
          </div>
        </div>

        {/* Battle Duel Lobby (Visible in Unlimited mode or when challenge is active) */}
        {(gameMode === "unlimited" || isChallengeActive) && (
          <div className="bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-6 mb-6 backdrop-blur-md animate-fade-in relative z-20 select-none shadow-xl">
            <h3 className="text-base font-black uppercase tracking-widest text-red-500 mb-2 flex items-center gap-2">
              ⚔️ PokéGrid Battle Arena Duel Lobby
            </h3>
            <p className="text-xs text-white dark:text-gray-300 mb-5 font-semibold leading-relaxed">
              Duel in real-time with a fellow Trainer! Host a lobby to generate a shareable challenge link using your current custom category filters, or enter an opponent's room code below to decrypt and load their exact grid seed.
            </p>

            {isChallengeActive ? (
              <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-scale-up">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-black text-red-400 font-mono tracking-widest bg-red-500/10 px-2 py-0.5 rounded-md">BATTLE LOBBY ACTIVE</span>
                  <p className="text-lg font-black text-gray-900 dark:text-white mt-1.5 font-mono tracking-wider">{challengeRoomCode}</p>
                </div>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const link = `${window.location.origin}${window.location.pathname}?room=${challengeRoomCode}`;
                        navigator.clipboard.writeText(link);
                        showToast("Battle Room Link copied to clipboard! Send it to your challenger!", 'success', "Link Copied");
                      }
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer shadow-md font-mono hover:scale-102 active:scale-98"
                  >
                    🔗 Copy Battle Link
                  </button>
                  <button
                    onClick={exitChallengeRoom}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer font-mono hover:scale-102 active:scale-98"
                  >
                    🚪 Exit Room
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Left Side: Host Room */}
                <div className="bg-white/30 dark:bg-black/35 border border-white/40 dark:border-white/5 p-5 rounded-2xl flex flex-col justify-between items-start text-left shadow-sm animate-scale-up">
                  <div>
                    <h5 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-1.5 animate-pulse-slow">
                      ⚔️ Host Battle Duel
                    </h5>
                    <p className="text-[11px] text-white dark:text-gray-400 mt-2 font-semibold leading-relaxed">
                      Generate a custom Battle Room using your current active customizer filters. Opponents will play the exact same category headers and puzzle grid seed in a parallel speed-score match!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newSeed = Math.floor(Math.random() * 1000000);
                      const code = encodeRoomCode(newSeed, allowedGens, allowedTypes, allowedSpecials);
                      if (typeof window !== "undefined") {
                        const link = `${window.location.origin}${window.location.pathname}?room=${code}`;
                        navigator.clipboard.writeText(link);
                        window.history.replaceState({}, document.title, link);
                      }
                      setChallengeRoomCode(code);
                      setIsChallengeActive(true);
                      setPlayerRole("host");
                      setCurrentTurn("host");
                      initGame("unlimited", { gens: allowedGens, types: allowedTypes, specials: allowedSpecials }, newSeed);
                      setShowCustomizer(false);
                      setShowHostSuccessModal(true);
                    }}
                    className="w-full mt-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-500/10 cursor-pointer text-center font-mono hover:scale-102 active:scale-98"
                  >
                    ⚔️ Host Battle Duel
                  </button>
                </div>

                {/* Right Side: Join Room */}
                <div className="bg-white/30 dark:bg-black/35 border border-white/40 dark:border-white/5 p-5 rounded-2xl flex flex-col justify-between items-start text-left shadow-sm animate-scale-up">
                  <div className="w-full">
                    <h5 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-1.5">
                      🎮 Join Challenger Room
                    </h5>
                    <p className="text-[11px] text-white dark:text-gray-400 mt-2 font-semibold leading-relaxed mb-4">
                      Paste or type a Battle Room Code shared by your friend to automatically decrypt the identical grid layout and duel!
                    </p>
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                      placeholder="e.g. 5A7F8B-E9C"
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-mono font-bold uppercase border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-center tracking-widest text-sm shadow-inner"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!joinCodeInput.trim()) return;
                      const decoded = decodeRoomCode(joinCodeInput);
                      if (decoded) {
                        setAllowedGens(decoded.gens);
                        setAllowedTypes(decoded.types);
                        setAllowedSpecials(decoded.specials);
                        customFiltersRef.current = { gens: decoded.gens, types: decoded.types, specials: decoded.specials };

                        const code = joinCodeInput.trim().toUpperCase().startsWith("ROOM-") ? joinCodeInput.trim().toUpperCase() : `ROOM-${joinCodeInput.trim().toUpperCase()}`;
                        if (typeof window !== "undefined") {
                          const link = `${window.location.origin}${window.location.pathname}?room=${code}`;
                          window.history.replaceState({}, document.title, link);
                        }
                        setChallengeRoomCode(code);
                        setIsChallengeActive(true);
                        setPlayerRole("challenger");
                        setCurrentTurn("host"); // Host always goes first
                        setGameMode("unlimited");

                        initGame("unlimited", decoded, decoded.seed);
                        setShowCustomizer(false);
                        setJoinCodeInput("");
                        showToast(`Decrypting identical grid categories. Speed and precision count. Good luck, Trainer! 🚀`, 'success', `Battle Room Joined!`);
                      } else {
                        showToast("Decryption failed! Please verify that the code format is correct.", 'error', "Invalid Room Code");
                      }
                    }}
                    className="w-full mt-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer text-center font-mono hover:scale-102 active:scale-98"
                  >
                    ⚔️ Join & Duel!
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Arena Customizer Panel (Only in Unlimited mode) */}
        {gameMode === "unlimited" && (
          <div className="bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-5 mb-6 backdrop-blur-md animate-fade-in relative z-20 select-none shadow-sm">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="w-full flex justify-between items-center text-sm font-black uppercase tracking-widest text-red-500 hover:text-red-600 focus:outline-none cursor-pointer"
            >
              <span className="flex items-center gap-2">
                🛠️ Unlimited Arena Customizer
                <span className="text-[10px] lowercase font-mono font-bold text-gray-400 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-md">
                  Active: {allowedGens.length + allowedTypes.length + allowedSpecials.length} categories
                </span>
              </span>
              <span className="text-xs transition-transform duration-300 transform font-bold">
                {showCustomizer ? "Close [-]" : "Customize [🛠️]"}
              </span>
            </button>

            {showCustomizer && (
              <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-5 animate-slide-down">

                {/* 1. Generations */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                    Generation Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => {
                      const isActive = allowedGens.includes(g);
                      return (
                        <button
                          key={`filter-gen-${g}`}
                          onClick={() => toggleGenFilter(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${isActive
                            ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/10 font-bold"
                            : "bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10 text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 font-semibold"
                            }`}
                        >
                          Gen {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Special constraints */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                    Special Category Filters
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['legendary', 'fossil', 'dual_type', 'single_type'].map((s) => {
                      const isActive = allowedSpecials.includes(s);
                      let label = '';
                      if (s === 'legendary') label = 'Legendary';
                      else if (s === 'fossil') label = 'Fossil';
                      else if (s === 'dual_type') label = 'Dual Type';
                      else if (s === 'single_type') label = 'Single Type';

                      return (
                        <button
                          key={`filter-special-${s}`}
                          onClick={() => toggleSpecialFilter(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${isActive
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/10 font-bold"
                            : "bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10 text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 font-semibold"
                            }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Types */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                    Pokémon Type Filters
                  </h4>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                    {['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map((t) => {
                      const isActive = allowedTypes.includes(t);
                      return (
                        <button
                          key={`filter-type-${t}`}
                          onClick={() => toggleTypeFilter(t)}
                          className={`px-3 py-1.5 rounded-full text-xs font-black capitalize border transition-all cursor-pointer ${isActive
                            ? `${TYPE_COLORS[t]} shadow-md border-transparent font-black`
                            : "bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10 text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300"
                            }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* HUD Game Stats Panel */}
        <div className={`grid grid-cols-1 ${isChallengeActive ? 'sm:grid-cols-5' : 'sm:grid-cols-3'} bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-5 mb-6 text-center gap-4 backdrop-blur-md`}>
          {/* PokeBall Guess Counter */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Arena Wrong Guesses Left</span>
            <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
              {Array.from({ length: 9 }).map((_, idx) => {
                const isUsed = idx >= guessesLeft;
                return (
                  <div
                    key={idx}
                    className={`relative w-6 h-6 transition-all duration-500 transform ${isUsed ? 'opacity-30 scale-90 grayscale' : 'animate-bounce-slow'}`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <Image src="/logo.png" alt="Pokeball" fill className="object-contain" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct Count */}
          <div className="flex flex-col items-center justify-center border-y sm:border-y-0 sm:border-x border-black/5 dark:border-white/5 py-3 sm:py-0">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Grid Complete</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {Object.keys(correctGuesses).length} <span className="text-lg font-medium text-gray-400">/ 9</span>
            </span>
          </div>

          {/* Rarity Uniqueness Score */}
          <div className="flex flex-col items-center justify-center sm:border-r sm:border-black/5 dark:sm:border-white/5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Rarity Uniqueness Score</span>
            <span className="text-3xl font-black text-emerald-500 dark:text-emerald-400 drop-shadow-sm">
              {rarityScore} <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pts</span>
            </span>
          </div>

          {/* Live Challenger Clock */}
          {isChallengeActive ? (
            <div className="flex flex-col items-center justify-center border-y sm:border-y-0 sm:border-r border-black/5 dark:border-white/5 py-3 sm:py-0">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">⏱️ Duel Clock</span>
              <span className="text-3xl font-black text-red-500 font-mono tracking-tight animate-pulse select-none">
                {currentTimeElapsed}
              </span>
            </div>
          ) : null}

          {/* Active Turn Indicator */}
          {isChallengeActive ? (
            <div className="flex flex-col items-center justify-center py-3 sm:py-0">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">🎮 Active Turn</span>
              <span className={`text-lg font-black font-mono tracking-wider ${currentTurn === playerRole
                ? 'text-emerald-500 dark:text-emerald-400 animate-pulse'
                : 'text-indigo-400 dark:text-indigo-500'
                }`}>
                {currentTurn === playerRole ? "👉 Your Turn!" : "⏳ Waiting..."}
              </span>
            </div>
          ) : null}
        </div>

        {/* 3x3 Battle Grid Arena / Creation Visualizer Wrapper */}
        <div className="relative">
          {isGenerating ? (
            <div className="bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-5 backdrop-blur-md shadow-2xl relative overflow-hidden animate-fade-in">
              {/* Futuristic animated laser scanning line sweeping across entire grid */}
              <div className="absolute left-0 w-full h-1 bg-red-500 shadow-[0_0_12px_#ef4444] animate-scan-laser pointer-events-none z-30" />

              {/* Construction Mainframe HUD */}
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500 animate-text-glitch">
                    [GRID SYNTHESIS ACTIVE]
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                    Stage: {generatingStep + 1} / 5
                  </span>
                </div>
              </div>

              {/* Blueprint Holographic Grid Layout */}
              <div className="grid grid-cols-4 gap-3 bg-white/10 dark:bg-black/40 border border-dashed border-red-500/20 p-4 rounded-3xl shadow-inner relative mb-6">

                {/* Top Left Empty Intersection */}
                <div className="aspect-square flex flex-col items-center justify-center font-mono text-[10px] sm:text-xs text-red-500/60 uppercase select-none animate-pulse">
                  <span>SYS:BOOT</span>
                  <span className="text-[8px] text-gray-500 mt-1">V4_SOLVER</span>
                </div>

                {/* Col Categories (resolving at Step 2) */}
                {grid.cols.map((cat, idx) => {
                  const resolved = generatingStep >= 2;
                  return (
                    <div
                      key={`col-load-${idx}`}
                      className={`aspect-square flex flex-col justify-center items-center rounded-2xl text-center p-2 shadow-sm relative overflow-hidden transition-all duration-500 border ${resolved
                        ? 'bg-emerald-500/10 border-emerald-400/40 animate-neon-glow-green text-emerald-400'
                        : 'bg-red-500/5 border-red-500/20 animate-cyber-pulse text-red-400/70'
                        }`}
                    >
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-gray-400">Col {idx + 1}</span>
                      {resolved ? (
                        <>
                          {cat.type === 'type' && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize mt-2 border ${TYPE_COLORS[cat.value] || 'bg-gray-500'}`}>
                              {cat.value}
                            </span>
                          )}
                          {cat.type === 'generation' && (
                            <span className="text-lg font-black text-gray-900 dark:text-gray-100 mt-1">{cat.label}</span>
                          )}
                          {cat.type === 'special' && (
                            <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase text-center mt-1 leading-tight">{cat.label}</span>
                          )}
                          <span className="text-[8px] font-mono font-extrabold text-emerald-500 mt-2 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Locked</span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center mt-1">
                          <span className="text-sm font-mono tracking-widest font-black animate-pulse">0x{Math.floor(seedRandom(idx + generatingStep) * 256).toString(16).toUpperCase()}</span>
                          <span className="text-[8px] font-mono mt-1 opacity-60">DECRYPT...</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Grid Rows */}
                {Array.from({ length: 3 }).map((_, r) => (
                  <React.Fragment key={`row-load-frag-${r}`}>

                    {/* Row Category Header (resolving at Step 3) */}
                    <div
                      className={`aspect-square flex flex-col justify-center items-center rounded-2xl text-center p-2 shadow-sm relative overflow-hidden transition-all duration-500 border ${generatingStep >= 3
                        ? 'bg-emerald-500/10 border-emerald-400/40 animate-neon-glow-green text-emerald-400'
                        : 'bg-red-500/5 border-red-500/20 animate-cyber-pulse text-red-400/70'
                        }`}
                    >
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-gray-400">Row {r + 1}</span>
                      {generatingStep >= 3 ? (
                        <>
                          {grid.rows[r].type === 'type' && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black capitalize mt-2 border ${TYPE_COLORS[grid.rows[r].value] || 'bg-gray-500'}`}>
                              {grid.rows[r].value}
                            </span>
                          )}
                          {grid.rows[r].type === 'generation' && (
                            <span className="text-lg font-black text-gray-900 dark:text-gray-100 mt-1">{grid.rows[r].label}</span>
                          )}
                          {grid.rows[r].type === 'special' && (
                            <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase text-center mt-1 leading-tight">{grid.rows[r].label}</span>
                          )}
                          <span className="text-[8px] font-mono font-extrabold text-emerald-500 mt-2 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Locked</span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center mt-1">
                          <span className="text-sm font-mono tracking-widest font-black animate-pulse">0x{Math.floor(seedRandom(r + 10 + generatingStep) * 256).toString(16).toUpperCase()}</span>
                          <span className="text-[8px] font-mono mt-1 opacity-60">DECRYPT...</span>
                        </div>
                      )}
                    </div>

                    {/* 3 Grid Cells in Row (resolving solvable solutions log at Step 4) */}
                    {Array.from({ length: 3 }).map((_, c) => {
                      const resolved = generatingStep >= 4;
                      const cellData = grid.cells[r]?.[c];
                      const solCount = cellData ? cellData.solutionsCount : 0;

                      return (
                        <div
                          key={`cell-load-${r}-${c}`}
                          className={`aspect-square flex flex-col items-center justify-center rounded-3xl border text-center transition-all duration-500 relative overflow-hidden select-none ${resolved
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5'
                            : 'bg-red-500/5 border-red-500/10 text-red-400/40'
                            }`}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(transparent_60%,rgba(0,0,0,0.15)_100%)] pointer-events-none" />

                          {resolved ? (
                            <div className="flex flex-col items-center justify-center p-1 animate-scale-up">
                              <span className="text-[10px] font-mono font-extrabold text-emerald-400 tracking-wider uppercase">Solvable</span>
                              <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-400 mt-1">
                                {solCount}+ solutions
                              </span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mt-2" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-1">
                              <span className="text-[9px] font-mono tracking-wider opacity-60 uppercase mb-1">Solving</span>
                              <span className="text-xs sm:text-sm font-mono font-black animate-pulse text-red-500/80">
                                {Math.floor(seedRandom(r * 3 + c + generatingStep * 9) * 90 + 10)}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* Console system logs */}
              <div className="w-full max-w-lg mx-auto font-mono text-xs text-gray-700 dark:text-gray-300 space-y-2 border border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/35 p-5 rounded-2xl shadow-inner">
                {Array.from({ length: 5 }).map((_, stepIdx) => {
                  const stepText = [
                    "⚡ Initializing PokéGrid Simulator Matrix...",
                    "📊 Loading Pokédex offline dataset (1025 entries)...",
                    "⚙️ Intersecting Row/Col category vectors...",
                    "🔬 Solving & validating grid solvability...",
                    "✨ Matrix verified! Locking Pokédex Arena!"
                  ][stepIdx];

                  const isActive = stepIdx === generatingStep;
                  const isCompleted = stepIdx < generatingStep;

                  return (
                    <div
                      key={stepIdx}
                      className={`flex items-center gap-2.5 transition-all duration-300 ${isActive
                        ? 'text-red-500 font-bold scale-[1.01] opacity-100'
                        : isCompleted
                          ? 'text-emerald-500 opacity-80'
                          : 'text-gray-400 dark:text-gray-600 opacity-40'
                        }`}
                    >
                      {isCompleted ? (
                        <FaCheck className="text-[10px] animate-pulse" />
                      ) : isActive ? (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                      )}
                      <span>{stepText}</span>
                    </div>
                  );
                })}

                {/* Visual cursor flashing */}
                <div className="border-t border-black/5 dark:border-white/5 pt-2 mt-2 flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                  <span>pokedex-arena-v4:~$</span>
                  {generatingStep < 4 ? (
                    <span className="animate-pulse">compiling_solver_matrix_thread...</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">simulation_successful. grid locked!</span>
                  )}
                  <div className="w-1.5 h-3 bg-gray-400 dark:bg-gray-300 animate-pulse ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/5 p-4 rounded-3xl backdrop-blur-md shadow-2xl relative animate-scale-up">

              {/* Top Left Empty Intersection */}
              <div className="aspect-square flex items-center justify-center font-black text-base sm:text-lg uppercase text-gray-400 dark:text-gray-500 select-none tracking-wider">
                🧩 Arena
              </div>

              {/* Col Categories */}
              {grid.cols.map((cat, idx) => (
                <div
                  key={`col-${idx}`}
                  className="aspect-square flex flex-col justify-center items-center rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-white/40 dark:border-white/5 text-center p-2 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.05)_0%,transparent_60%] pointer-events-none" />
                  <span className="text-[11px] sm:text-xs uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest">Col {idx + 1}</span>
                  {cat.type === 'type' && (
                    <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black capitalize mt-2 shadow-md border tracking-wider ${TYPE_COLORS[cat.value] || 'bg-gray-500'}`}>
                      {cat.value}
                    </span>
                  )}
                  {cat.type === 'generation' && (
                    <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mt-1.5 tracking-tight">{cat.label}</span>
                  )}
                  {cat.type === 'special' && (
                    <span className="text-xs sm:text-base font-black text-red-500 dark:text-red-400 uppercase tracking-wider text-center mt-2 leading-tight">{cat.label}</span>
                  )}
                </div>
              ))}

              {/* Grid rows */}
              {Array.from({ length: 3 }).map((_, r) => (
                <React.Fragment key={`row-frag-${r}`}>

                  {/* Row Category Header */}
                  <div className="aspect-square flex flex-col justify-center items-center rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-white/40 dark:border-white/5 text-center p-2 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.05)_0%,transparent_60%] pointer-events-none" />
                    <span className="text-[11px] sm:text-xs uppercase font-black text-gray-400 dark:text-gray-500 tracking-widest">Row {r + 1}</span>
                    {grid.rows[r].type === 'type' && (
                      <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black capitalize mt-2 shadow-md border tracking-wider ${TYPE_COLORS[grid.rows[r].value] || 'bg-gray-500'}`}>
                        {grid.rows[r].value}
                      </span>
                    )}
                    {grid.rows[r].type === 'generation' && (
                      <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mt-1.5 tracking-tight">{grid.rows[r].label}</span>
                    )}
                    {grid.rows[r].type === 'special' && (
                      <span className="text-xs sm:text-base font-black text-red-500 dark:text-red-400 uppercase tracking-wider text-center mt-2 leading-tight">{grid.rows[r].label}</span>
                    )}
                  </div>

                  {/* Grid 3 Cells in Row */}
                  {Array.from({ length: 3 }).map((_, c) => {
                    const cellKey = `${r}-${c}`;
                    const matchedPokemon = correctGuesses[cellKey];
                    const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;
                    const marker = guessesHistory[r * 3 + c];
                    const isFailed = marker === "🟥";

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        id={`cell-${r}-${c}`}
                        onClick={() => {
                          if (isChallengeActive && currentTurn !== playerRole) {
                            showToast("Wait for your turn, Trainer!", 'info', "Opponent's Turn");
                            return;
                          }
                          if (!matchedPokemon && !isFailed && guessesLeft > 0) {
                            setSelectedCell({ r, c });
                          }
                        }}
                        className={`aspect-square flex flex-col items-center justify-center rounded-3xl border text-center transition-all duration-300 relative select-none overflow-hidden ${matchedPokemon
                          ? 'bg-gradient-to-br from-emerald-500/10 to-green-600/10 border-emerald-400/40 dark:border-emerald-600/20 cursor-default shadow-lg shadow-emerald-500/5 animate-scale-up'
                          : isFailed
                            ? 'bg-gradient-to-br from-red-500/10 to-rose-600/10 border-red-400/40 dark:border-red-600/20 cursor-default shadow-lg shadow-red-500/5 animate-scale-up'
                            : guessesLeft === 0
                              ? 'bg-black/10 dark:bg-black/40 border-black/10 dark:border-white/5 cursor-not-allowed opacity-80'
                              : isSelected
                                ? 'bg-white/40 dark:bg-gray-900/40 border-red-500 ring-2 ring-red-500/20 cursor-pointer scale-[1.02]'
                                : 'bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/5 hover:bg-white/30 dark:hover:bg-black/30 hover:border-red-500/50 hover:scale-102 cursor-pointer shadow-inner'
                          }`}
                      >
                        {/* Diagnostic cell helper shimmers */}
                        <div className="absolute inset-0 bg-linear-[135deg,rgba(255,255,255,0.05)_0%,transparent_60%] pointer-events-none" />

                        {matchedPokemon ? (
                          // Correct Answer State (With Bigger, Enhanced Fonts!)
                          <div className="relative w-full h-full p-2 flex flex-col justify-between items-center group/cell animate-scale-up">

                            {/* Overlay checkmark */}
                            <div className="absolute top-2 right-2 z-10 text-emerald-500 dark:text-emerald-400 text-sm">
                              <FaCheck className="drop-shadow-sm filter" />
                            </div>

                            {/* Pokemon sprite */}
                            <div className="relative w-11/12 h-2/3 transition-transform duration-300 hover:scale-105">
                              <Image
                                src={matchedPokemon.sprite || '/eevee.png'}
                                alt={matchedPokemon.name}
                                fill
                                sizes="(max-width: 110px) 100vw, 110px"
                                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] p-0.5"
                              />
                            </div>

                            {/* Name and rarity points tag (Larger Fonts!) */}
                            <div className="w-full text-center relative z-10">
                              <p className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white capitalize truncate leading-normal tracking-wide">
                                {matchedPokemon.name}
                              </p>
                              <span className="text-[11px] sm:text-xs font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-md mt-1 inline-block tracking-wider border border-emerald-500/10">
                                {Math.max(20, 100 - Math.min(80, grid.cells[r][c].solutionsCount))} Pts
                              </span>
                            </div>
                          </div>
                        ) : isFailed ? (
                          // Failed/Missed Cell State!
                          <div className="flex flex-col items-center justify-center text-red-500 dark:text-red-400 animate-scale-up">
                            <FaTimesCircle className="text-3xl mb-1.5 animate-pulse" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-500/80">Missed</span>
                          </div>
                        ) : guessesLeft === 0 ? (
                          // Empty Blocked State on Loss (Larger Fonts!)
                          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                            <FaTimesCircle className="text-2xl mb-1.5" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Locked</span>
                          </div>
                        ) : (
                          // Empty Searchable State (Larger Fonts!)
                          <div className="flex flex-col items-center justify-center text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors">
                            <FaRegQuestionCircle className="text-3xl mb-2 animate-pulse-slow" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Select</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

              {/* Autocomplete Inline Search Floating Container */}
              {selectedCell && (
                <div
                  ref={searchContainerRef}
                  className={`absolute z-40 bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-2xl p-4 backdrop-blur-xl animate-fade-in transition-all duration-300 ease-in-out ${searchQuery.trim().length > 0
                    ? 'w-[320px] sm:w-[420px] -translate-x-4 sm:-translate-x-12'
                    : 'w-72'
                    }`}
                  style={{
                    top: `${Math.min(65, (selectedCell.r * 22) + 20)}%`,
                    left: `${Math.min(60, (selectedCell.c * 22) + 12)}%`
                  }}
                >
                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-black/5 dark:border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                      Select for R{selectedCell.r + 1}C{selectedCell.c + 1}
                    </span>
                    <button
                      onClick={() => setSelectedCell(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>

                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Pokemon name..."
                    className={`w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-inner ${searchQuery.trim().length > 0 ? 'text-sm' : 'text-xs'
                      }`}
                    autoComplete="off"
                  />

                  {/* Suggestions autocomplete list */}
                  {searchQuery.trim().length > 0 && (
                    <ul className="mt-2 max-h-48 overflow-y-auto border border-black/5 dark:border-white/5 rounded-xl divide-y divide-black/5 dark:divide-white/5 bg-white/50 dark:bg-black/30">
                      {autocompleteList.length > 0 ? (
                        autocompleteList.map((p) => (
                          <li
                            key={p.id}
                            onClick={() => selectPokemon(p)}
                            className="px-4 py-2.5 cursor-pointer flex items-center justify-between hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 text-sm font-black capitalize transition-colors"
                          >
                            <div className="flex items-center gap-2">
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
                        <li className="px-3 py-4 text-center text-xs font-medium text-gray-500">
                          No Pokémon matches.
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Solutions Inspector (Triggered on Surrender, Defeat, Victory or Correct cell answer) */}
        {(() => {
          const isGameOver = guessesLeft === 0 || isSurrendered || Object.keys(correctGuesses).length === 9;
          const hasSolvedAny = Object.keys(correctGuesses).length > 0;
          const showExplorer = isGameOver || hasSolvedAny;

          if (!showExplorer) return null;

          return (
            <div className="mt-8 bg-white/40 dark:bg-gray-950/40 border border-white/50 dark:border-white/5 rounded-3xl p-5 backdrop-blur-md animate-fade-in">
              <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                🧠 PokéGrid Solution Log Explorer
              </h3>
              <p className="text-xs text-white dark:text-gray-400 mb-4 font-semibold leading-relaxed">
                {isGameOver ? (
                  <span>🏆 Game Completed! Select any cell coordinate below to view all possible correct answers:</span>
                ) : (
                  <span>🔒 Active Game: Select any correctly answered cell coordinates below (marked with ✅) to view alternative choices. Solve other cells to unlock their solutions!</span>
                )}
              </p>

              <div className="flex gap-2.5 flex-wrap mb-4">
                {Array.from({ length: 3 }).map((_, r) =>
                  Array.from({ length: 3 }).map((_, c) => {
                    const cellKey = `${r}-${c}`;
                    const isSolved = correctGuesses[cellKey] !== undefined;
                    const isClickable = isGameOver || isSolved;

                    return (
                      <button
                        key={`sol-btn-${r}-${c}`}
                        disabled={!isClickable}
                        onClick={() => {
                          if (grid && grid.cells[r]?.[c]) {
                            const targetCell = grid.cells[r][c];
                            const detailedSolutions = targetCell.solutions.map(name =>
                              pokemonDataset.find(p => p.name.toLowerCase() === name.toLowerCase())
                            ).filter(Boolean);

                            setActiveCellSolutions({
                              r, c,
                              rowLabel: grid.rows[r].label,
                              colLabel: grid.cols[c].label,
                              list: detailedSolutions
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${!isClickable
                          ? 'opacity-30 bg-gray-200/20 dark:bg-black/10 border-gray-300/20 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                          : activeCellSolutions && activeCellSolutions.r === r && activeCellSolutions.c === c
                            ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20 cursor-pointer'
                            : isSolved
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/5 cursor-pointer shadow-sm'
                              : 'bg-white/50 dark:bg-black/20 border-white/30 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-red-500 hover:text-red-500 cursor-pointer'
                          }`}
                      >
                        {isSolved ? `✅ Cell (${r + 1}, ${c + 1})` : isClickable ? `Cell (${r + 1}, ${c + 1})` : `🔒 Cell (${r + 1}, ${c + 1})`}
                      </button>
                    );
                  })
                )}
              </div>

              {activeCellSolutions && (
                <div className="p-4 bg-white/20 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl animate-fade-in">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-black/5 dark:border-white/5">
                    <span className="text-xs font-black uppercase text-gray-900 dark:text-white">
                      Solutions for Cell ({activeCellSolutions.r + 1}, {activeCellSolutions.c + 1}) —
                      <span className="text-red-500 capitalize ml-1">{activeCellSolutions.rowLabel}</span> &
                      <span className="text-red-500 capitalize ml-1">{activeCellSolutions.colLabel}</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                      {activeCellSolutions.list.length} Valid choices
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto pr-1">
                    {activeCellSolutions.list.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white/35 dark:bg-black/20 border border-white/20 dark:border-white/5 p-2 rounded-xl text-center flex flex-col justify-between items-center group/sol select-none hover:scale-102 transition-transform"
                      >
                        <div className="relative w-12 h-12">
                          <Image src={p.sprite || '/logo.png'} alt={p.name} fill className="object-contain" />
                        </div>
                        <p className="text-[9px] font-black text-gray-800 dark:text-gray-300 capitalize truncate w-full mt-1.5">
                          {p.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Global Game Rules Help Modal */}
        {showInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-scale-up relative">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <FaTimesCircle className="text-xl" />
              </button>

              <h2 className="text-2xl font-black mb-4 text-red-500 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
                <FaInfoCircle /> PokéGrid Arena Rules
              </h2>

              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed max-h-[350px] overflow-y-auto pr-1">
                <p>
                  Welcome to <strong className="text-red-500">Pok&eacute;Grid Arena</strong>! If you love grid-based trivia, Sudoku, and Pok&eacute;mon, you are in the perfect place.
                </p>
                <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-red-400 mt-3">Objective</h4>
                <p>
                  You must fill all **9 cells** in the 3x3 grid. For each cell, select a single Pok&eacute;mon that matches BOTH the Row condition on the left and the Column condition on the top.
                </p>
                <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-red-400 mt-3">Core Rules</h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Limited Guesses</strong>: You have exactly <strong>9 guesses</strong>. Every incorrect guess decreases guesses left. To complete the grid perfectly, you cannot make a single mistake!</li>
                  <li><strong>No Repeats</strong>: You can only use a Pok&eacute;mon species <strong>once</strong> in the grid. If you place Pikachu in cell (1,1), you cannot use Pikachu in any other cell in the same game.</li>
                  <li><strong>Category Matches</strong>: Pokémon with dual-types count for both! For example, Charizard (Fire/Flying) matches both "Fire" and "Flying" categories.</li>
                </ul>
                <h4 className="font-extrabold uppercase text-[10px] tracking-wider text-red-400 mt-3">Dynamic Rarity Scoring</h4>
                <p>
                  Each correct guess awards points based on the **rarity** (scarcity) of the Pokémon in our encyclopedia:
                  - If a cell has very few possible correct matching Pokémon, choosing one yields massive points (up to **100 Pts**)!
                  - If a cell has many possible solutions (like Gen 1 + Normal Type), choosing a solution yields lower points (minimum **20 Pts**).
                  - Try to get the highest score close to 900 by picking unique, lesser-known Pokémon!
                </p>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="w-full mt-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/10"
              >
                Let's Play!
              </button>
            </div>
          </div>
        )}

        {/* Battle Room Created Success Modal */}
        {showHostSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in animate-scale-up">
            <div className="bg-white/95 dark:bg-gray-900/95 border border-emerald-500/20 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center relative select-none">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow text-3xl select-none">
                ⚔️
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1 uppercase">
                Battle Room Active!
              </h2>
              <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-4">
                Challenge Lobby Initialized
              </p>

              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                Your parallel duel lobby is live! Share the room code or battle link below with your challenger to play the exact same grid seed.
              </p>

              {/* Room Code Display Block */}
              <div className="bg-black/5 dark:bg-black/35 border border-black/5 dark:border-white/5 rounded-2xl p-4 mb-4 flex flex-col items-center justify-center relative shadow-inner">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1.5 font-mono">Room Code</span>
                <span className="text-xl font-black text-gray-900 dark:text-white font-mono tracking-widest uppercase bg-black/10 dark:bg-white/5 px-4 py-1.5 rounded-lg border border-black/5 dark:border-white/5">
                  {challengeRoomCode.replace("ROOM-", "")}
                </span>

                <button
                  onClick={() => {
                    const justCode = challengeRoomCode.replace("ROOM-", "");
                    navigator.clipboard.writeText(justCode);
                    showToast("Room Code copied to clipboard!", 'success', "Code Copied");
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer shadow-sm font-mono hover:scale-102 hover:border-emerald-500/40"
                >
                  📋 Copy Room Code
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const link = `${window.location.origin}${window.location.pathname}?room=${challengeRoomCode}`;
                      navigator.clipboard.writeText(link);
                      showToast("Battle Link copied to clipboard!", 'success', "Link Copied");
                    }
                  }}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md shadow-indigo-500/10 cursor-pointer text-xs uppercase tracking-wider font-mono hover:scale-102 transition-all"
                >
                  🔗 Copy Battle Link
                </button>
                <button
                  onClick={() => {
                    setShowHostSuccessModal(false);
                  }}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-md shadow-red-500/10 cursor-pointer text-xs uppercase tracking-wider font-mono hover:scale-102 transition-all"
                >
                  Start Battle! 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Repeat Pokémon Warning Modal */}
        {showRepeatWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white/95 dark:bg-gray-900/95 border border-red-500/20 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center animate-scale-up relative">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow text-3xl select-none">
                ⚠️
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2 uppercase">
                Species Repeat Blocked!
              </h2>

              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                You've already placed a <strong className="capitalize text-red-500">{warnedPokemon}</strong> in this grid!
                Grid Arena rules strictly prohibit repeating identical Pokémon species. Try selecting a different matching Pokémon!
              </p>

              <button
                onClick={() => {
                  setShowRepeatWarning(false);
                  setWarnedPokemon("");
                }}
                className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/10 cursor-pointer text-xs uppercase tracking-wider font-mono"
              >
                Got it, Trainer!
              </button>
            </div>
          </div>
        )}

        {/* Custom Surrender Confirmation Modal */}
        {showSurrenderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white/95 dark:bg-gray-900/95 border border-red-500/20 dark:border-gray-850 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center animate-scale-up relative">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow text-3xl">
                🏳️
              </div>

              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                Surrender Battle?
              </h2>

              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Are you sure you want to surrender this battle? The grid will be locked, all guesses will expire, and all solutions will be revealed. You will receive a defeat but can inspect the entire solution log!
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={confirmSurrender}
                  className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/10 cursor-pointer text-xs uppercase tracking-wider font-mono"
                >
                  Yes, Surrender Battle
                </button>
                <button
                  onClick={() => setShowSurrenderModal(false)}
                  className="w-full py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-800 dark:text-gray-300 font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all text-xs cursor-pointer font-mono"
                >
                  No, Keep Playing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen Modal (Victory or Defeat) */}
        {showGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl backdrop-blur-md text-center animate-scale-up relative">

              {gameOverStatus === 'victory' ? (
                // VICTORY
                <>
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                    <FaTrophy className="text-3xl" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Grid Complete! 🏆
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mt-2 text-sm">
                    Amazing! You filled the entire Pok&eacute;Grid Arena grid!
                  </p>
                </>
              ) : (
                // DEFEAT
                <>
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                    <FaTimesCircle className="text-3xl" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    guesses Expired 💔
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 font-semibold mt-2 text-sm">
                    You ran out of guesses! Better luck in the next battle!
                  </p>
                </>
              )}

              {/* Score breakdown logs */}
              <div className="bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 p-4 rounded-2xl my-6 text-xs font-semibold text-gray-700 dark:text-gray-300 text-left space-y-2.5">
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="text-gray-900 dark:text-white font-extrabold">{Object.keys(correctGuesses).length} / 9 Cells</span>
                </div>
                <div className="flex justify-between">
                  <span>Guesses Spent:</span>
                  <span className="text-gray-900 dark:text-white font-extrabold">{guessesUsed} / 9</span>
                </div>
                <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-2 font-bold text-sm">
                  <span>Final Uniqueness Score:</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-extrabold">{rarityScore} Pts</span>
                </div>
                {isChallengeActive && (
                  <div className="flex justify-between border-t border-black/5 dark:border-white/5 pt-2 font-bold text-sm">
                    <span>Duel Time Elapsed:</span>
                    <span className="text-red-500 font-mono font-extrabold">{timeElapsedString} ⏱️</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={copyShareGrid}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-500/10"
                >
                  <FaShareAlt /> Share Grid Results
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (isChallengeActive) {
                        const decoded = decodeRoomCode(challengeRoomCode);
                        if (decoded) {
                          initGame("unlimited", decoded, decoded.seed);
                        } else {
                          initGame("unlimited");
                        }
                      } else {
                        initGame(gameMode);
                      }
                    }}
                    className="py-2.5 bg-white/50 dark:bg-white/10 border border-white/30 dark:border-white/10 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-white/20 transition-all text-xs"
                  >
                    Retry Grid
                  </button>
                  <button
                    onClick={() => setShowGameOver(false)}
                    className="py-2.5 bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-300 font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/15 transition-all text-xs"
                  >
                    Review Board
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Custom Toast / Alert Notification Overlay */}
        {customToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down pointer-events-none select-none max-w-sm w-full px-4">
            <div className="bg-white/95 dark:bg-gray-900/95 border border-white/40 dark:border-white/5 shadow-2xl rounded-2xl p-4 flex items-center gap-3 backdrop-blur-xl pointer-events-auto">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${customToast.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : customToast.type === 'error'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                }`}>
                {customToast.type === 'success' ? '🟩' : customToast.type === 'error' ? '❌' : 'ℹ️'}
              </div>
              <div className="text-left flex-1 min-w-0">
                {customToast.title && (
                  <h4 className="text-xs font-black uppercase text-gray-900 dark:text-white mb-0.5 tracking-wider truncate">
                    {customToast.title}
                  </h4>
                )}
                <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 leading-normal">
                  {customToast.message}
                </p>
              </div>
              <button
                onClick={() => setCustomToast(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 cursor-pointer shrink-0"
              >
                <FaTimesCircle className="text-sm" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
