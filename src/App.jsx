import React, { useState, useEffect, useRef } from 'react';
import { Play, SkipForward, RotateCcw, Zap, ArrowLeft } from 'lucide-react';
import { categories } from './words';

const CatchphraseGame = () => {

  const [currentWord, setCurrentWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [usedWords, setUsedWords] = useState([]);
  const [wordTimeLeft, setWordTimeLeft] = useState(15);
  const [showPassWarning, setShowPassWarning] = useState(false);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategorySelect, setShowCategorySelect] = useState(true);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [roundStats, setRoundStats] = useState({ team1Correct: [], team2Correct: [], skipped: [] });
  const [showStats, setShowStats] = useState(false);
  const [losingTeam, setLosingTeam] = useState(null);
  const [showStealPrompt, setShowStealPrompt] = useState(false);
  const timerRef = useRef(null);
  const wordTimerRef = useRef(null);
  const tickSoundRef = useRef(null);
  const audioContextRef = useRef(null);

  const playBeep = (frequency, duration) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playTick = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  };

  const getTickInterval = (timeLeft) => {
    if (timeLeft > 30) return 1000;
    if (timeLeft > 20) return 800;
    if (timeLeft > 10) return 600;
    if (timeLeft > 5) return 400;
    return 200;
  };

  const startTickSound = () => {
    const tick = () => {
      if (!isPaused) {
        playTick();
      }
      const interval = getTickInterval(timeLeft);
      tickSoundRef.current = setTimeout(tick, interval);
    };
    tick();
  };

  const stopTickSound = () => {
    if (tickSoundRef.current) {
      clearTimeout(tickSoundRef.current);
      tickSoundRef.current = null;
    }
  };

  const getRandomWord = () => {
    const words = categories[selectedCategory].words;
    const availableWords = words.filter(w => !usedWords.includes(w));
    if (availableWords.length === 0) {
      setUsedWords([]);
      return words[Math.floor(Math.random() * words.length)];
    }
    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setUsedWords([...usedWords, word]);
    setWordTimeLeft(15);
    setShowPassWarning(false);
    return word;
  };

  const selectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setShowCategorySelect(false);
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setGameOver(false);
    setShowScoreboard(false);
    setShowStats(false);
    setTimeLeft(60);
    setUsedWords([]);
    setCurrentTeam(1);
    setRoundStats({ team1Correct: [], team2Correct: [], skipped: [] });
    setCurrentWord(getRandomWord());
    startTickSound();
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    playBeep(300, 0.1);
  };

  const skipWord = () => {
    if (isPlaying && !gameOver && !isPaused) {
      playBeep(200, 0.1);
      setRoundStats(prev => ({
        ...prev,
        skipped: [...prev.skipped, currentWord]
      }));
      setCurrentWord(getRandomWord());
    }
  };

  const gotIt = () => {
    if (isPlaying && !gameOver && !isPaused) {
      playBeep(600, 0.15);
      if (currentTeam === 1) {
        setRoundStats(prev => ({
          ...prev,
          team1Correct: [...prev.team1Correct, currentWord]
        }));
        setCurrentTeam(2);
      } else {
        setRoundStats(prev => ({
          ...prev,
          team2Correct: [...prev.team2Correct, currentWord]
        }));
        setCurrentTeam(1);
      }
      setCurrentWord(getRandomWord());
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setGameOver(false);
    setShowScoreboard(false);
    setShowCategorySelect(true);
    setSelectedCategory(null);
    setTimeLeft(60);
    setCurrentWord('');
    setUsedWords([]);
    setWordTimeLeft(15);
    setShowPassWarning(false);
    setTeam1Score(0);
    setTeam2Score(0);
    stopTickSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
    }
  };

  const continueToScoreboard = () => {
    // Only the team in possession when time ended gets 1 point
    // Correct guesses are for statistical tracking only, not scoring
    if (losingTeam === 1) {
      setTeam1Score(prev => prev + 1);
    } else if (losingTeam === 2) {
      setTeam2Score(prev => prev + 1);
    }
    setShowStats(true);
    stopTickSound();
  };

  const continueToStealPrompt = () => {
    setShowStats(false);
    setShowStealPrompt(true);
  };

  const handleSteal = (didSteal) => {
    if (didSteal) {
      const winningTeam = losingTeam === 1 ? 2 : 1;
      if (winningTeam === 1) {
        setTeam1Score(prev => prev + 2);
      } else {
        setTeam2Score(prev => prev + 2);
      }
    }
    setShowStealPrompt(false);
    setShowScoreboard(true);
  };

  const nextRound = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setGameOver(false);
    setShowScoreboard(false);
    setShowCategorySelect(true);
    setSelectedCategory(null);
    setTimeLeft(60);
    setWordTimeLeft(15);
    setCurrentWord('');
    setUsedWords([]);
    setShowPassWarning(false);
    setCurrentTeam(1);
    setRoundStats({ team1Correct: [], team2Correct: [], skipped: [] });
    setShowStats(false);
    setShowStealPrompt(false);
    setLosingTeam(null);
    stopTickSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  };

  const restartRound = () => {
    setIsPaused(false);
    setTimeLeft(60);
    setWordTimeLeft(15);
    setShowPassWarning(false);
    setUsedWords([]);
    setCurrentTeam(1);
    setRoundStats({ team1Correct: [], team2Correct: [], skipped: [] });
    setCurrentWord(getRandomWord());
    stopTickSound();
    startTickSound();
  };

  const backToCategories = () => {
    setShowCategorySelect(true);
    setSelectedCategory(null);
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !gameOver && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setGameOver(true);
            setLosingTeam(currentTeam);
            stopTickSound();
            playBeep(150, 0.5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeLeft, gameOver, isPaused, currentTeam]);

  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      wordTimerRef.current = setInterval(() => {
        setWordTimeLeft(prev => {
          if (prev <= 1) {
            setShowPassWarning(true);
            playBeep(800, 0.2);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (wordTimerRef.current) {
        clearInterval(wordTimerRef.current);
      }
    };
  }, [isPlaying, currentWord, gameOver, isPaused]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full relative border-4 border-cyan-400">
        {/* Neon glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur opacity-20"></div>
        
        <div className="relative">
          <div className="flex items-center justify-center mb-6">
            <Zap className="text-cyan-400 mr-2 animate-pulse" size={40} />
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              WORD DASH
            </h1>
            <Zap className="text-pink-400 ml-2 animate-pulse" size={40} />
          </div>

          {showCategorySelect && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-300 text-center mb-4">Choose Category</h2>
              {Object.entries(categories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => selectCategory(key)}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border-2 border-cyan-400 hover:border-purple-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 flex items-center justify-center"
                >
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <span className="text-xl">{category.name}</span>
                </button>
              ))}
            </div>
          )}
          
          {!showCategorySelect && !isPlaying && !gameOver && !showScoreboard && (
            <div className="text-center">
              <div className="mb-4">
                <button
                  onClick={backToCategories}
                  className="text-cyan-300 hover:text-cyan-200 font-bold flex items-center justify-center mx-auto mb-4"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Change Category
                </button>
                <div className="text-2xl text-purple-300 mb-4">
                  <span className="text-4xl">{categories[selectedCategory].icon}</span>
                  <br />
                  {categories[selectedCategory].name}
                </div>
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-6 px-12 rounded-full text-2xl shadow-lg transform transition hover:scale-105 flex items-center justify-center mx-auto border-2 border-cyan-300"
              >
                <Play className="mr-2" size={32} />
                START GAME
              </button>
            </div>
          )}

          {!showCategorySelect && (
            <>
              <div className="mb-8">
                <div className={`text-6xl font-bold text-center mb-4 ${timeLeft <= 5 && isPlaying ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                  {timeLeft}
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden border-2 border-slate-600">
                  <div 
                    className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-cyan-400 to-purple-500'}`}
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  />
                </div>
              </div>

              {isPlaying && (
                <>
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-cyan-400 rounded-2xl p-8 mb-6 min-h-32 flex items-center justify-center shadow-lg relative overflow-hidden">
                    {/* Animated border glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
                    
                    <h2 className="text-4xl font-black text-white text-center break-words relative z-10 drop-shadow-lg">{currentWord}</h2>
                    
                    {showPassWarning && !isPaused && (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex flex-col items-center justify-center animate-pulse border-4 border-red-400">
                        <p className="text-4xl font-black text-white mb-2 drop-shadow-lg">⚡ PASS IT! ⚡</p>
                        <p className="text-xl text-white drop-shadow-md">Give to your partner!</p>
                      </div>
                    )}
                    
                    {isPaused && (
                      <div className="absolute inset-0 bg-slate-900 bg-opacity-95 rounded-xl flex flex-col items-center justify-center p-4 border-4 border-purple-500">
                        <p className="text-4xl font-black text-purple-400 mb-4">⏸️ PAUSED</p>
                        <button
                          onClick={restartRound}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg mb-2 w-full max-w-xs border-2 border-cyan-400"
                        >
                          🔄 Restart Round
                        </button>
                        <p className="text-sm text-purple-300 mt-2">Click Resume below to continue</p>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 text-center">
                    <div className="text-sm text-cyan-300 mb-1 font-bold">Word Time: {wordTimeLeft}s</div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden border-2 border-slate-600">
                      <div 
                        className={`h-full transition-all duration-1000 ${wordTimeLeft <= 5 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gradient-to-r from-purple-400 to-cyan-400'}`}
                        style={{ width: `${(wordTimeLeft / 15) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <button
                      onClick={togglePause}
                      className={`w-full ${isPaused ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400' : 'bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400'} text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105 border-2`}
                    >
                      {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={skipWord}
                      disabled={isPaused}
                      className={`${isPaused ? 'bg-slate-600 cursor-not-allowed border-slate-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 border-yellow-400'} text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 flex items-center justify-center border-2`}
                    >
                      <SkipForward className="mr-2" size={24} />
                      Skip
                    </button>
                    <button
                      onClick={gotIt}
                      disabled={isPaused}
                      className={`${isPaused ? 'bg-slate-600 cursor-not-allowed border-slate-500' : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-green-400'} text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 border-2`}
                    >
                      Got It!
                    </button>
                  </div>
                </>
              )}

              {gameOver && !showScoreboard && !showStats && (
                <div className="text-center">
                  <h2 className="text-4xl font-black text-red-400 mb-6 drop-shadow-lg animate-pulse">⚡ TIME'S UP! ⚡</h2>
                  <button
                    onClick={continueToScoreboard}
                    className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg transform transition hover:scale-105 border-2 border-cyan-300"
                  >
                    View Round Stats
                  </button>
                </div>
              )}

              {showStats && !showScoreboard && !showStealPrompt && (
                <div className="text-center max-h-[70vh] overflow-y-auto">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
                    📊 ROUND STATS
                  </h2>

                  <div className="space-y-4 mb-6 text-left">
                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 border-2 border-blue-400">
                      <h3 className="text-xl font-bold text-blue-300 mb-2 flex items-center justify-between">
                        <span>⚡ Team 1 Got Right</span>
                        <span className="text-2xl">{roundStats.team1Correct.length} pts</span>
                      </h3>
                      <div className="mt-3 space-y-1">
                        {roundStats.team1Correct.length > 0 ? (
                          roundStats.team1Correct.map((word, idx) => (
                            <div key={idx} className="text-blue-200 bg-blue-950 bg-opacity-50 px-3 py-2 rounded">
                              ✓ {word}
                            </div>
                          ))
                        ) : (
                          <div className="text-blue-300 italic">No words guessed</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-900 to-purple-900 rounded-xl p-4 border-2 border-pink-400">
                      <h3 className="text-xl font-bold text-pink-300 mb-2 flex items-center justify-between">
                        <span>⚡ Team 2 Got Right</span>
                        <span className="text-2xl">{roundStats.team2Correct.length} pts</span>
                      </h3>
                      <div className="mt-3 space-y-1">
                        {roundStats.team2Correct.length > 0 ? (
                          roundStats.team2Correct.map((word, idx) => (
                            <div key={idx} className="text-pink-200 bg-pink-950 bg-opacity-50 px-3 py-2 rounded">
                              ✓ {word}
                            </div>
                          ))
                        ) : (
                          <div className="text-pink-300 italic">No words guessed</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900 to-orange-900 rounded-xl p-4 border-2 border-yellow-400">
                      <h3 className="text-xl font-bold text-yellow-300 mb-2 flex items-center justify-between">
                        <span>⏭️ Skipped Words</span>
                        <span className="text-2xl">{roundStats.skipped.length}</span>
                      </h3>
                      <div className="mt-3 space-y-1">
                        {roundStats.skipped.length > 0 ? (
                          roundStats.skipped.map((word, idx) => (
                            <div key={idx} className="text-yellow-200 bg-yellow-950 bg-opacity-50 px-3 py-2 rounded">
                              ⏭️ {word}
                            </div>
                          ))
                        ) : (
                          <div className="text-yellow-300 italic">No words skipped</div>
                        )}
                      </div>
                    </div>

                    {losingTeam && (
                      <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-xl p-4 border-2 border-red-400">
                        <div className="text-red-200 text-center">
                          <p className="text-lg font-bold mb-1">⏰ Timer ran out on:</p>
                          <p className="text-2xl font-black">TEAM {losingTeam}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={continueToStealPrompt}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105 border-2 border-cyan-300"
                  >
                    Continue
                  </button>
                </div>
              )}

              {showStealPrompt && !showScoreboard && (
                <div className="text-center">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                    🎯 STEAL OPPORTUNITY
                  </h2>
                  
                  <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl p-6 border-2 border-green-400 mb-6">
                    <p className="text-green-200 text-lg mb-3">
                      Team {losingTeam === 1 ? 2 : 1} has a chance to steal!
                    </p>
                    <p className="text-green-300 text-sm">
                      A steal is worth <span className="font-bold text-xl">2 points</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleSteal(true)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105 border-2 border-green-400"
                    >
                      ✓ Yes, They Got It! (+2 pts)
                    </button>
                    <button
                      onClick={() => handleSteal(false)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:scale-105 border-2 border-red-400"
                    >
                      ✗ No Steal
                    </button>
                  </div>
                </div>
              )}

              {showScoreboard && (
                <div className="text-center">
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">SCOREBOARD</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 border-4 border-blue-400">
                      <h3 className="text-xl font-bold text-blue-300 mb-3">⚡ TEAM 1 ⚡</h3>
                      <div className="text-5xl font-black text-blue-200 mb-3 drop-shadow-lg">{team1Score}</div>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setTeam1Score(team1Score - 1)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-400"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setTeam1Score(team1Score + 1)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-2 px-6 rounded-lg border-2 border-green-400"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-900 to-purple-900 rounded-xl p-4 border-4 border-pink-400">
                      <h3 className="text-xl font-bold text-pink-300 mb-3">⚡ TEAM 2 ⚡</h3>
                      <div className="text-5xl font-black text-pink-200 mb-3 drop-shadow-lg">{team2Score}</div>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setTeam2Score(team2Score - 1)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-2 px-6 rounded-lg border-2 border-red-400"
                        >
                          -
                        </button>
                        <button
                          onClick={() => setTeam2Score(team2Score + 1)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-2 px-6 rounded-lg border-2 border-green-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={nextRound}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 border-2 border-purple-400"
                    >
                      Next Round
                    </button>
                    <button
                      onClick={reset}
                      className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 flex items-center justify-center border-2 border-slate-500"
                    >
                      <RotateCcw className="mr-2" size={20} />
                      New Game
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return <CatchphraseGame />;
};

export default App;

