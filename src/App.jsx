import React, { useState, useEffect, useRef, useMemo } from 'react';

// --- Sound Synthesizer (Pure Functional Web Audio API, zero libraries) ---
let audioCtx = null;
let isSoundMuted = false;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

const sfx = {
  setMuted(muted) {
    isSoundMuted = muted;
  },

  playPop() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  },

  playDing() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  },

  playZap() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  },

  playBuzzer() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.setValueAtTime(130, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  },

  playFanfare() {
    if (isSoundMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
    });
  }
};

// --- Color Palette for Slices ---
const PART_COLORS = [
  { bg: '#8b5cf6', border: '#7c3aed', light: '#ede9fe', text: '#5b21b6', name: 'Purple' },
  { bg: '#0ea5e9', border: '#0284c7', light: '#e0f2fe', text: '#0369a1', name: 'Blue' },
  { bg: '#10b981', border: '#059669', light: '#d1fae5', text: '#065f46', name: 'Mint' },
  { bg: '#f97316', border: '#ea580c', light: '#ffedd5', text: '#9a3412', name: 'Orange' },
  { bg: '#ec4899', border: '#db2777', light: '#fce7f3', text: '#9d174d', name: 'Pink' },
  { bg: '#eab308', border: '#ca8a04', light: '#fef9c3', text: '#854d0e', name: 'Yellow' },
];

// --- Random Problem Generator ---
const MULT_LEVELS = [
  { id: 0, name: 'רמה 1: חימום (דו-ספרתי)' },
  { id: 1, name: 'רמה 2: אלופי המאות (תלת-ספרתי)' },
  { id: 2, name: 'רמה 3: אתגר הענקים (מתקדם)' },
];

const DIV_LEVELS = [
  { id: 0, name: 'רמה 1: חילוק פשוט' },
  { id: 1, name: 'רמה 2: חילוק תלת-ספרתי' },
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomProblem(op, lvl) {
  if (op === 'mult') {
    if (lvl === 0) {
      // 2-digit: factor 2-5, target 22-89
      const factor = getRandomInt(2, 5);
      const tens = getRandomInt(2, 8) * 10;
      const ones = getRandomInt(2, 9);
      return { target: tens + ones, factor };
    } else if (lvl === 1) {
      // 3-digit: factor 3-6, target 115-395
      const factor = getRandomInt(3, 6);
      const hundreds = getRandomInt(1, 3) * 100;
      const tens = getRandomInt(1, 8) * 10;
      const ones = [2, 4, 5, 6, 8][getRandomInt(0, 4)];
      return { target: hundreds + tens + ones, factor };
    } else {
      // Mega challenge: factor 3-8, target 220-790
      const factor = getRandomInt(3, 8);
      const hundreds = getRandomInt(2, 6) * 100;
      const tens = getRandomInt(2, 9) * 10;
      const ones = getRandomInt(1, 9);
      return { target: hundreds + tens + ones, factor };
    }
  } else {
    // Division: guarantees clean integer division without remainder
    if (lvl === 0) {
      // 2-digit friendly division (e.g. 64/4, 85/5, 96/3, 84/4)
      const divisor = [3, 4, 5, 6][getRandomInt(0, 3)];
      const tensMultiplier = getRandomInt(1, 3) * 10;
      const part1 = divisor * tensMultiplier;
      const part2 = divisor * getRandomInt(1, 5);
      return { target: part1 + part2, factor: divisor };
    } else {
      // 3-digit friendly division (e.g. 125/5, 144/6, 216/6, 175/5, 208/4)
      const divisor = [4, 5, 6, 7, 8][getRandomInt(0, 4)];
      const tensMultiplier = getRandomInt(2, 6) * 10;
      const part1 = divisor * tensMultiplier;
      const part2 = divisor * getRandomInt(2, 9);
      return { target: part1 + part2, factor: divisor };
    }
  }
}

// Helper to split into standard place values (e.g. 125 -> [100, 20, 5])
function getPlaceValueSplit(num) {
  if (num <= 0) return [num];
  const s = num.toString();
  const res = [];
  for (let i = 0; i < s.length; i++) {
    const digit = parseInt(s[i], 10);
    if (digit !== 0) {
      const place = Math.pow(10, s.length - 1 - i);
      res.push(digit * place);
    }
  }
  return res.length > 0 ? res : [num];
}

// Helper to split into friendly parts divisible by divisor
function getDivisionFriendlySplit(num, divisor) {
  if (num <= 0 || divisor <= 0) return [num];
  const step = divisor * 10;
  let part1 = Math.floor(num / step) * step;
  if (part1 === num) {
    part1 -= step;
  }
  if (part1 > 0 && (num - part1) % divisor === 0) {
    return [part1, num - part1];
  }
  const q = Math.floor(num / divisor);
  const q1 = Math.floor(q / 2);
  const q2 = q - q1;
  return [q1 * divisor, q2 * divisor];
}

export default function App() {
  // Navigation & Settings
  const [operation, setOperation] = useState('mult'); // 'mult' | 'div'
  const [levelIdx, setLevelIdx] = useState(1); // default Level 2 (125 * 4)
  const [soundMuted, setSoundMuted] = useState(false);
  const [stars, setStars] = useState(50);
  const [streak, setStreak] = useState(0);

  // Custom Problem Sandbox
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customTarget, setCustomTarget] = useState('125');
  const [customFactor, setCustomFactor] = useState('4');

  // Random Current Problem (initial: 125 * 4)
  const [currentProblem, setCurrentProblem] = useState(() => ({ target: 125, factor: 4 }));

  const targetNumber = currentProblem.target;
  const multiplier = currentProblem.factor;

  // Game Phases:
  // 1 = 'SPLIT' (Student creates distributions)
  // 2 = 'SOLVE_PARTS' (Student solves each mini chunk)
  // 3 = 'GRAND_TOTAL' (Student combines into final total)
  // 4 = 'VICTORY' (Celebration, full distributive recap)
  const [stage, setStage] = useState(1);

  // Student's Created Distributions
  const [parts, setParts] = useState(['100', '20', '5']);

  // Answers to sub-problems
  const [subAnswers, setSubAnswers] = useState({});
  const [subErrors, setSubErrors] = useState({});

  // Grand Total answer
  const [grandAnswer, setGrandAnswer] = useState('');
  const [grandError, setGrandError] = useState(false);

  // Canvas ref for Confetti
  const canvasRef = useRef(null);

  // Sound toggle
  const toggleSound = () => {
    const nextMuted = !soundMuted;
    sfx.setMuted(nextMuted);
    setSoundMuted(nextMuted);
    if (!nextMuted) sfx.playPop();
  };

  function resetForNewProblem(target, op = operation, factor = multiplier) {
    setStage(1);
    setSubAnswers({});
    setSubErrors({});
    setGrandAnswer('');
    setGrandError(false);

    // Initial helpful split suggestion
    if (op === 'div') {
      const divParts = getDivisionFriendlySplit(target, factor);
      setParts(divParts.map(String));
    } else {
      const initialParts = getPlaceValueSplit(target);
      setParts(initialParts.map(String));
    }
  }

  const handleSelectOperation = (newOp) => {
    sfx.playPop();
    setOperation(newOp);
    setIsCustomMode(false);
    const newLvl = 0;
    setLevelIdx(newLvl);
    const newProb = generateRandomProblem(newOp, newLvl);
    setCurrentProblem(newProb);
    resetForNewProblem(newProb.target, newOp, newProb.factor);
  };

  const handleSelectLevel = (newIdx) => {
    sfx.playPop();
    setLevelIdx(newIdx);
    setIsCustomMode(false);
    const newProb = generateRandomProblem(operation, newIdx);
    setCurrentProblem(newProb);
    resetForNewProblem(newProb.target, operation, newProb.factor);
  };

  const handleNextProblem = () => {
    sfx.playPop();
    if (isCustomMode) {
      resetForNewProblem(currentProblem.target, operation, currentProblem.factor);
    } else {
      const newProb = generateRandomProblem(operation, levelIdx);
      setCurrentProblem(newProb);
      resetForNewProblem(newProb.target, operation, newProb.factor);
    }
  };

  const handleLaunchCustom = () => {
    sfx.playZap();
    const t = parseInt(customTarget, 10) || 100;
    const f = parseInt(customFactor, 10) || 2;
    const newProb = { target: Math.max(t, 2), factor: Math.max(f, 1) };
    setCurrentProblem(newProb);
    resetForNewProblem(newProb.target, operation, newProb.factor);
  };

  // --- Student Distribution Actions ---
  const currentSum = useMemo(() => {
    return parts.reduce((acc, p) => {
      const val = parseInt(p, 10);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }, [parts]);

  const diff = targetNumber - currentSum;
  const isSumValid = diff === 0 && parts.every(p => parseInt(p, 10) > 0);

  const handlePartChange = (index, value) => {
    sfx.playPop();
    const newParts = [...parts];
    // Keep only numbers or empty string
    newParts[index] = value.replace(/[^0-9]/g, '');
    setParts(newParts);
  };

  const handleAddPart = () => {
    if (parts.length >= 6) return;
    sfx.playPop();
    setParts([...parts, '']);
  };

  const handleRemovePart = (index) => {
    if (parts.length <= 2) return;
    sfx.playPop();
    const newParts = parts.filter((_, idx) => idx !== index);
    setParts(newParts);
  };

  const applyPlaceValueSplit = () => {
    sfx.playZap();
    const pv = getPlaceValueSplit(targetNumber);
    setParts(pv.map(String));
  };

  const applyDivisionSplit = () => {
    sfx.playZap();
    const divParts = getDivisionFriendlySplit(targetNumber, multiplier);
    setParts(divParts.map(String));
  };

  const applyEvenSplit = () => {
    sfx.playZap();
    const half1 = Math.floor(targetNumber / 2);
    const half2 = targetNumber - half1;
    setParts([half1.toString(), half2.toString()]);
  };

  // --- Step 1 to Step 2 Transition ---
  const handleLockInSplit = () => {
    if (!isSumValid) {
      sfx.playBuzzer();
      return;
    }
    sfx.playFanfare();
    setStage(2);
    setSubAnswers({});
    setSubErrors({});
  };

  // --- Step 2: Solve Sub-Problems ---
  const handleSubAnswerChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setSubAnswers(prev => ({ ...prev, [index]: cleaned }));
    // Clear error on edit
    setSubErrors(prev => ({ ...prev, [index]: false }));
  };

  const checkSubAnswer = (index, partVal) => {
    const entered = parseInt(subAnswers[index], 10);
    const expected = operation === 'mult' 
      ? partVal * multiplier 
      : Math.floor(partVal / multiplier);

    if (entered === expected) {
      sfx.playDing();
      setSubErrors(prev => ({ ...prev, [index]: false }));
      return true;
    } else {
      sfx.playBuzzer();
      setSubErrors(prev => ({ ...prev, [index]: true }));
      return false;
    }
  };

  // Check if all sub problems are solved
  const areAllSubProblemsCorrect = useMemo(() => {
    if (stage < 2) return false;
    return parts.every((pStr, idx) => {
      const p = parseInt(pStr, 10);
      const expected = operation === 'mult' ? p * multiplier : Math.floor(p / multiplier);
      return parseInt(subAnswers[idx], 10) === expected;
    });
  }, [parts, subAnswers, operation, multiplier, stage]);

  const handleAdvanceToGrandTotal = () => {
    sfx.playZap();
    setStage(3);
  };

  // --- Step 3: Check Grand Total ---
  const grandExpected = operation === 'mult' 
    ? targetNumber * multiplier 
    : Math.floor(targetNumber / multiplier);

  const handleCheckGrandTotal = () => {
    const entered = parseInt(grandAnswer, 10);
    if (entered === grandExpected) {
      sfx.playFanfare();
      setGrandError(false);
      setStars(prev => prev + 25);
      setStreak(prev => prev + 1);
      setStage(4);
      triggerConfetti();
    } else {
      sfx.playBuzzer();
      setGrandError(true);
    }
  };

  // --- Pure Canvas Confetti Burst Engine ---
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b'];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 8,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        alpha: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.vr;
        if (frame > 40) {
          p.alpha -= 0.015;
        }

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive && frame < 150) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    requestAnimationFrame(animate);
  };

  const opSymbol = operation === 'mult' ? '×' : '÷';

  return (
    <div className="game-container">
      {/* Native Canvas Confetti Layer */}
      <canvas ref={canvasRef} className="confetti-canvas" />

      {/* Top Header */}
      <header className="game-header">
        <div className="logo-group">
          <div className="logo-badge">⚡</div>
          <div>
            <h1 className="game-title">ספלאש מתמטיקה!</h1>
            <p className="game-subtitle">הרפתקת חוק הפילוג</p>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat-chip stars">
            <span>⭐</span>
            <span>{stars} כוכבים</span>
          </div>
          <div className="stat-chip streak">
            <span>🔥</span>
            <span>רצף: {streak}</span>
          </div>
          <button 
            type="button" 
            className="sound-btn" 
            onClick={toggleSound}
            title={soundMuted ? 'הפעל צליל' : 'השתק צליל'}
          >
            {soundMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </header>

      {/* Controls & Level Panel */}
      <nav className="controls-panel">
        <div className="mode-tabs">
          <button 
            type="button"
            className={`tab-btn ${operation === 'mult' && !isCustomMode ? 'active' : ''}`}
            onClick={() => handleSelectOperation('mult')}
          >
            <span>✖️ כפל</span>
          </button>
          <button 
            type="button"
            className={`tab-btn ${operation === 'div' && !isCustomMode ? 'active' : ''}`}
            onClick={() => handleSelectOperation('div')}
          >
            <span>➗ חילוק</span>
          </button>
          <button 
            type="button"
            className={`tab-btn ${isCustomMode ? 'active' : ''}`}
            onClick={() => { sfx.playPop(); setIsCustomMode(true); }}
          >
            <span>🛠️ ארגז חול חופשי</span>
          </button>
        </div>

        {!isCustomMode && (
          <div className="level-pills">
            {(operation === 'mult' ? MULT_LEVELS : DIV_LEVELS).map((lvl, idx) => (
              <button
                key={lvl.id}
                type="button"
                className={`level-btn ${levelIdx === idx ? 'active' : ''}`}
                onClick={() => handleSelectLevel(idx)}
              >
                {lvl.name}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Custom Sandbox Form */}
      {isCustomMode && (
        <section className="custom-creator-box">
          <div className="custom-inputs">
            <span>בנו תרגיל משלכם:</span>
            <input 
              type="text" 
              className="custom-input"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="125"
            />
            <span>{opSymbol}</span>
            <input 
              type="text" 
              className="custom-input"
              value={customFactor}
              onChange={(e) => setCustomFactor(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="4"
            />
          </div>
          <button 
            type="button" 
            className="toy-btn amber"
            onClick={handleLaunchCustom}
          >
            🚀 צאו לאתגר המותאם אישית!
          </button>
        </section>
      )}

      {/* Mission Board (Current Challenge) */}
      <main className="challenge-hero">
        <div className="challenge-top">
          <div className="step-indicator">
            <div className={`step-dot ${stage === 1 ? 'active' : stage > 1 ? 'done' : ''}`}>1</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>פירוק</span>
            <span style={{ color: '#cbd5e1' }}>←</span>
            <div className={`step-dot ${stage === 2 ? 'active' : stage > 2 ? 'done' : ''}`}>2</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>פילוג</span>
            <span style={{ color: '#cbd5e1' }}>←</span>
            <div className={`step-dot ${stage === 3 ? 'active' : stage > 3 ? 'done' : ''}`}>3</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>חיבור</span>
            <span style={{ color: '#cbd5e1' }}>←</span>
            <div className={`step-dot ${stage === 4 ? 'done' : ''}`}>🏆</div>
          </div>

          {!isCustomMode && (
            <button
              type="button"
              className="toy-btn ghost"
              style={{ fontSize: 14, padding: '7px 16px' }}
              onClick={handleNextProblem}
              title="הגרלת תרגיל אקראי חדש"
            >
              🎲 תרגיל אקראי חדש
            </button>
          )}
        </div>

        {/* Big Problem Display */}
        <div className="challenge-math-display">
          <div className="big-number-badge target">{targetNumber}</div>
          <div className="big-number-badge operator">{opSymbol}</div>
          <div className="big-number-badge operand">{multiplier}</div>
          <div className="big-number-badge operator">=</div>
          <div className="big-number-badge question">
            {stage === 4 ? grandExpected : '?'}
          </div>
        </div>

        {/* ================= STAGE 1: THE SLICING STUDIO ================= */}
        {stage === 1 && (
          <section className="split-studio">
            <div className="phase-banner">
              <h2 className="phase-title">
                <span>✂️</span> שלב 1: איך תרצו לפרק את {targetNumber}?
              </h2>
              <p className="phase-desc">
                אתם המפקדים! פרקו את <strong>{targetNumber}</strong> לחלקים שנוח לחשב בראש. מספרים עגולים הם הסוד לחישוב מהיר!
              </p>
            </div>

            {/* Quick-Split Helpers */}
            <div className="quick-helpers">
              {operation === 'mult' ? (
                <button type="button" className="toy-btn purple" onClick={applyPlaceValueSplit}>
                  🪄 פירוק לפי מבנה עשרוני (מאות, עשרות, אחדות)
                </button>
              ) : (
                <button type="button" className="toy-btn purple" onClick={applyDivisionSplit}>
                  🪄 פירוק חכם שמתחלק ב-{multiplier}
                </button>
              )}
              <button type="button" className="toy-btn blue" onClick={applyEvenSplit}>
                ⚖️ חלוקה לשני חצאים
              </button>
              <button 
                type="button" 
                className="toy-btn pink" 
                onClick={handleAddPart}
                disabled={parts.length >= 6}
              >
                ➕ הוסיפו חלק נוסף
              </button>
            </div>

            {/* Editable Parts Cards */}
            <div className="parts-row">
              {parts.map((partVal, idx) => {
                const color = PART_COLORS[idx % PART_COLORS.length];
                return (
                  <React.Fragment key={idx}>
                    <div 
                      className="part-card"
                      style={{ borderColor: color.border, backgroundColor: color.light }}
                    >
                      <div className="part-header" style={{ color: color.text }}>
                        <span>חלק {idx + 1}</span>
                        {parts.length > 2 && (
                          <button
                            type="button"
                            className="part-remove-btn"
                            onClick={() => handleRemovePart(idx)}
                            title="הסירו חלק זה"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="part-input"
                        value={partVal}
                        onChange={(e) => handlePartChange(idx, e.target.value)}
                        placeholder="0"
                        maxLength={5}
                      />
                    </div>
                    {idx < parts.length - 1 && <span className="plus-symbol">+</span>}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Balance Progress Meter */}
            <div className="meter-card">
              <div className="meter-header">
                <span className="meter-sum-text">
                  סכום החלקים שלכם: <strong>{currentSum}</strong> / היעד: <strong>{targetNumber}</strong>
                </span>

                {diff === 0 && isSumValid && (
                  <span className="meter-status-pill exact">
                    🎯 בול פגיעה! הסכום מושלם ומוכן לפילוג!
                  </span>
                )}
                {diff > 0 && (
                  <span className="meter-status-pill under">
                    ➕ חסרים עוד {diff} כדי להגיע ל-{targetNumber}!
                  </span>
                )}
                {diff < 0 && (
                  <span className="meter-status-pill over">
                    ⚠️ עברתם את היעד ב-{Math.abs(diff)}! הורידו חלקים כדי להגיע ל-{targetNumber}.
                  </span>
                )}
                {diff === 0 && !isSumValid && (
                  <span className="meter-status-pill over">
                    ⚠️ נא למלא בכל חלק מספר הגדול מ-0!
                  </span>
                )}
              </div>

              <div className="meter-bar-track">
                <div 
                  className="meter-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentSum / targetNumber) * 100))}%`,
                    backgroundColor: diff === 0 && isSumValid ? '#10b981' : diff > 0 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>

            {/* Live Visual Area Model / Chocolate Bar */}
            <div className="area-model-box">
              <div className="area-model-title">
                <span>🍫 מודל שטח חזותי (פרוסות שוקולד יחסיות)</span>
                <span>רוחב כולל = {targetNumber}</span>
              </div>
              <div className="area-model-track">
                {parts.map((pStr, idx) => {
                  const val = parseInt(pStr, 10) || 0;
                  const pct = targetNumber > 0 ? (val / targetNumber) * 100 : 0;
                  const color = PART_COLORS[idx % PART_COLORS.length];
                  if (pct <= 0) return null;
                  return (
                    <div
                      key={idx}
                      className="area-segment"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color.bg,
                      }}
                      title={`חלק ${idx + 1}: ${val}`}
                    >
                      {pct > 8 ? val : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lock in Action */}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                className="toy-btn green"
                style={{ fontSize: 20, padding: '14px 32px' }}
                onClick={handleLockInSplit}
                disabled={!isSumValid}
              >
                🚀 נעילת הפירוק ופילוג {opSymbol} {multiplier}!
              </button>
            </div>
          </section>
        )}

        {/* ================= STAGE 2: DISTRIBUTE & SOLVE MINI-CHUNKS ================= */}
        {stage === 2 && (
          <section className="distribute-stage">
            <div className="phase-banner">
              <h2 className="phase-title">
                <span>⚡</span> שלב 2: נפזר (נפלג) את ה-{opSymbol} {multiplier}
              </h2>
              <p className="phase-desc">
                לפי חוק הפילוג, אנחנו מכניסים את ה-<strong>{opSymbol} {multiplier}</strong> לכל חלק בנפרד! פתרו כל תרגיל קטן:
              </p>
            </div>

            <div className="cards-container">
              {parts.map((pStr, idx) => {
                const partVal = parseInt(pStr, 10);
                const color = PART_COLORS[idx % PART_COLORS.length];
                const expected = operation === 'mult' 
                  ? partVal * multiplier 
                  : Math.floor(partVal / multiplier);
                const isCorrect = parseInt(subAnswers[idx], 10) === expected;
                const hasError = subErrors[idx];

                return (
                  <div 
                    key={idx} 
                    className="subproblem-card"
                    style={{ borderColor: color.border }}
                  >
                    <div 
                      style={{ 
                        background: color.light, 
                        color: color.text, 
                        padding: '4px 12px', 
                        borderRadius: 999, 
                        fontWeight: 700, 
                        fontSize: 13 
                      }}
                    >
                      חלק {idx + 1}
                    </div>

                    <div className="subproblem-equation">
                      <span>({partVal} {opSymbol} {multiplier})</span>
                      <span>=</span>
                    </div>

                    <input
                      type="text"
                      className={`subproblem-input ${isCorrect ? 'correct' : hasError ? 'wrong' : ''}`}
                      value={subAnswers[idx] || ''}
                      onChange={(e) => handleSubAnswerChange(idx, e.target.value)}
                      onBlur={() => checkSubAnswer(idx, partVal)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') checkSubAnswer(idx, partVal);
                      }}
                      placeholder="?"
                      maxLength={6}
                    />

                    <div className="subproblem-feedback">
                      {isCorrect && <span style={{ color: '#059669', fontWeight: 700 }}>✅ מעולה!</span>}
                      {hasError && !isCorrect && (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>❌ נסו שוב!</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10 }}>
              <button 
                type="button" 
                className="toy-btn ghost" 
                onClick={() => setStage(1)}
              >
                ↩️ שינוי הפירוק שלי
              </button>

              <button
                type="button"
                className="toy-btn green"
                style={{ fontSize: 18, padding: '12px 28px' }}
                onClick={handleAdvanceToGrandTotal}
                disabled={!areAllSubProblemsCorrect}
              >
                ✨ מעבר לחיבור התוצאות!
              </button>
            </div>
          </section>
        )}

        {/* ================= STAGE 3: GRAND TOTAL ================= */}
        {stage === 3 && (
          <section className="grand-total-card">
            <div className="phase-banner" style={{ marginBottom: 10 }}>
              <h2 className="phase-title" style={{ color: '#854d0e' }}>
                <span>🎯</span> שלב 3: מחברים את כל התוצאות יחד!
              </h2>
              <p className="phase-desc" style={{ color: '#a16207' }}>
                חברו את כל התוצאות החלקיות כדי למצוא את התשובה ל-<strong>{targetNumber} {opSymbol} {multiplier}</strong>!
              </p>
            </div>

            <div className="grand-equation">
              {parts.map((pStr, idx) => {
                const partVal = parseInt(pStr, 10);
                const subVal = operation === 'mult' ? partVal * multiplier : Math.floor(partVal / multiplier);
                return (
                  <React.Fragment key={idx}>
                    <span 
                      style={{ 
                        background: 'white', 
                        padding: '8px 16px', 
                        borderRadius: 12, 
                        border: '2px solid #eab308' 
                      }}
                    >
                      {subVal}
                    </span>
                    {idx < parts.length - 1 && <span>+</span>}
                  </React.Fragment>
                );
              })}
              <span>=</span>
              <input
                type="text"
                className="total-input"
                value={grandAnswer}
                onChange={(e) => {
                  setGrandAnswer(e.target.value.replace(/[^0-9]/g, ''));
                  setGrandError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckGrandTotal();
                }}
                placeholder="סך הכל"
                maxLength={7}
                autoFocus
              />
            </div>

            {grandError && (
              <div style={{ color: '#dc2626', fontWeight: 700, fontSize: 16 }}>
                ❌ לא מדויק, חברו את התוצאות החלקיות בזהירות.
              </div>
            )}

            <button
              type="button"
              className="toy-btn amber"
              style={{ fontSize: 20, padding: '14px 36px' }}
              onClick={handleCheckGrandTotal}
            >
              🎉 בדיקת התוצאה הסופית!
            </button>
          </section>
        )}

        {/* ================= STAGE 4: VICTORY & RECAP ================= */}
        {stage === 4 && (
          <section className="victory-modal-card">
            <div className="victory-stars">🌟 🏆 🌟</div>
            <h2 className="victory-title">עבודה מדהימה ואלופה!</h2>
            <p style={{ fontSize: 18, color: '#065f46', fontWeight: 600 }}>
              פיצחתם את חוק הפילוג בעזרת הפירוק המיוחד שהמצאתם!
            </p>

            <div className="victory-recap-box">
              <div style={{ marginBottom: 8, fontSize: 18, color: '#15803d' }}>
                משפט הפילוג המלא שלכם:
              </div>
              <div className="victory-math-line">
                <strong>{targetNumber} {opSymbol} {multiplier}</strong>
                {' = '}
                {parts.map(p => `(${p} ${opSymbol} ${multiplier})`).join(' + ')}
              </div>
              <div className="victory-math-line" style={{ marginTop: 6, fontSize: 24, color: '#047857' }}>
                = {parts.map(p => {
                  const val = parseInt(p, 10);
                  return operation === 'mult' ? val * multiplier : Math.floor(val / multiplier);
                }).join(' + ')} = <strong>{grandExpected}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
              <button
                type="button"
                className="toy-btn blue"
                onClick={() => resetForNewProblem(targetNumber)}
              >
                🔄 נסו פירוק אחר לאותו תרגיל
              </button>

              <button
                type="button"
                className="toy-btn green"
                style={{ fontSize: 18, padding: '12px 30px' }}
                onClick={handleNextProblem}
              >
                ⭐ לאתגר הבא! ←
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Pedagogical Tip for 10-Year-Olds */}
      <aside className="pedagogy-tip">
        <span className="tip-icon">💡</span>
        <div>
          <strong>טיפ כוח-על במתמטיקה:</strong> חוק הפילוג אומר שאפשר לפרק מספר גדול (כמו <strong>125</strong>) לכל חלקים שנרצה (100 + 20 + 5 או 50 + 50 + 25). מחשבים כל חלק בנפרד, ואז פשוט מחברים את כל התוצאות!
        </div>
      </aside>
    </div>
  );
}
