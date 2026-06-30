import React, { useState, useEffect, useRef, useCallback } from "react";

/**
 * SafariSTEM Mini Lesson: Traffic Lights
 * Audience: learners aged 7-10
 *
 * Design notes (see written design explanation for full rationale):
 * - Palette: sky blue background, cream cards, asphalt-grey text, and the three
 *   real traffic-light colors used ONLY for the light itself (not decoration),
 *   so colour always carries real meaning.
 * - Every light state pairs colour with a word (STOP / WAIT / GO) so the lesson
 *   doesn't rely on colour perception alone.
 * - No external libraries, no large images, no web fonts loaded from a slow CDN -
 *   everything is plain CSS + inline SVG so it stays light on low-end devices
 *   and poor connections.
 * - State lives in React (useState), not localStorage/sessionStorage, since
 *   browser storage isn't reliably available in every hosting context. A real
 *   deployment could add localStorage in ~5 lines if persistence across visits
 *   is wanted (noted in the design write-up).
 */

const STAGES = ["intro", "learn", "activity", "quiz", "success"];

const FUN_FACTS = [
  "Some traffic lights for people who can't see well also make a sound.",
  "Traffic lights are sometimes called 'stop lights' or 'robots' in different countries!",
  "The world's longest traffic light is in New Jersey and drivers can even stay there for up to 5 minutes.",
];

const QUIZ_QUESTIONS = [
  {
    q: "What should a driver do when the light turns red?",
    options: ["Go faster", "Stop", "Turn on the radio"],
    answer: 1,
  },
  {
    q: "What does the yellow light mean?",
    options: ["Stop", "Get ready, the light is about to change", "Go"],
    answer: 1,
  },
  {
    q: "When is it safe for cars to go?",
    options: ["When the light is green", "When the light is red", "Whenever they want"],
    answer: 0,
  },
];

const LIGHT_INFO = {
  red: { word: "STOP", desc: "Cars must stop and wait." },
  yellow: { word: "WAIT", desc: "Get ready - the light is about to change." },
  green: { word: "GO", desc: "It's safe for cars to go." },
};

function TrafficLight({ active, size = 160 }) {
  const order = ["red", "yellow", "green"];
  return (
    <svg
      width={size}
      height={size * 2.1}
      viewBox="0 0 160 336"
      role="img"
      aria-label={`Traffic light showing ${LIGHT_INFO[active].word}`}
    >
      <title>{`Traffic light: ${active}`}</title>
      <rect x="20" y="0" width="120" height="320" rx="24" fill="#33363D" />
      {order.map((color, i) => {
        const cy = 70 + i * 92;
        const isActive = color === active;
        const fills = { red: "#E63946", yellow: "#FFC83D", green: "#2EC4B6" };
        return (
          <g key={color}>
            <circle
              cx="80"
              cy={cy}
              r="42"
              fill={isActive ? fills[color] : "#46494F"}
              stroke={isActive ? "#fff" : "none"}
              strokeWidth={isActive ? 4 : 0}
            />
            {isActive && (
              <>
                <circle cx="65" cy={cy - 8} r="6" fill="#33363D" />
                <circle cx="95" cy={cy - 8} r="6" fill="#33363D" />
                <path
                  d={`M 60 ${cy + 14} Q 80 ${cy + 26} 100 ${cy + 14}`}
                  stroke="#33363D"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </>
            )}
          </g>
        );
      })}
      <rect x="68" y="320" width="24" height="16" fill="#33363D" />
    </svg>
  );
}

function ProgressBar({ stageIndex }) {
  const pct = Math.round((stageIndex / (STAGES.length - 1)) * 100);
  return (
    <div style={styles.progressTrack} aria-hidden="true">
      <div style={{ ...styles.progressFill, width: `${pct}%` }} />
    </div>
  );
}

function BigButton({ children, onClick, color = "#2B2D33", style, ...rest }) {
  return (
    <button
      onClick={onClick}
      style={{ ...styles.bigButton, background: color, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

export default function TrafficLightLesson() {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = STAGES[stageIndex];

  // Animated demo light for the "learn" stage
  const [demoColor, setDemoColor] = useState("red");
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (stage !== "learn" || reducedMotion.current) return;
    const sequence = ["red", "yellow", "green", "yellow"];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % sequence.length;
      setDemoColor(sequence[i]);
    }, 1800);
    return () => clearInterval(id);
  }, [stage]);

  // Activity stage
  const [activityIndex, setActivityIndex] = useState(0);
  const [activityFeedback, setActivityFeedback] = useState(null);
  const activityScenarios = [
    { prompt: "A child wants to cross the road safely. What should the light show?", correct: "red" },
    { prompt: "Cars have been waiting and need to know the light is about to change. What should it show?", correct: "yellow" },
    { prompt: "The road is clear and it's a car's turn to drive. What should the light show?", correct: "green" },
  ];

  const handleActivityChoice = (color) => {
    const correct = activityScenarios[activityIndex].correct === color;
    setActivityFeedback({ correct, color });
    if (correct) {
      setTimeout(() => {
        setActivityFeedback(null);
        if (activityIndex < activityScenarios.length - 1) {
          setActivityIndex((n) => n + 1);
        } else {
          setStageIndex(3);
        }
      }, 1100);
    }
  };

  // Quiz stage
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);

  const handleQuizChoice = (optionIndex) => {
    const correct = QUIZ_QUESTIONS[quizIndex].answer === optionIndex;
    setQuizFeedback({ correct, optionIndex });
    if (correct) setQuizScore((s) => s + 1);
    setTimeout(() => {
      setQuizFeedback(null);
      if (quizIndex < QUIZ_QUESTIONS.length - 1) {
        setQuizIndex((n) => n + 1);
      } else {
        setStageIndex(4);
      }
    }, 1100);
  };

  const restart = () => {
    setStageIndex(0);
    setActivityIndex(0);
    setActivityFeedback(null);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFeedback(null);
    setDemoColor("red");
  };

  const [factIndex, setFactIndex] = useState(0);
  const nextFact = useCallback(
    () => setFactIndex((i) => (i + 1) % FUN_FACTS.length),
    []
  );

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes pop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .stLesson button:focus-visible {
          outline: 4px solid #1D5FA8;
          outline-offset: 2px;
        }
        .stLesson { font-family: Verdana, 'Trebuchet MS', sans-serif; }
      `}</style>

      <div className="stLesson" style={styles.shell}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>SafariSTEM</p>
          <h1 style={styles.title}>Traffic light explorer</h1>
        </header>

        <ProgressBar stageIndex={stageIndex} />

        <main style={styles.card}>
          {stage === "intro" && (
            <section style={styles.centerCol}>
              <TrafficLight active="red" size={120} />
              <h2 style={styles.h2}>What do traffic lights say?</h2>
              <p style={styles.body}>
                Traffic lights talk to drivers and walkers using colours and words.
                In this lesson you will learn what each colour means, try a road
                safety activity, and take a short quiz.
              </p>
              <BigButton onClick={() => setStageIndex(1)} color="#2EC4B6">
                Start the lesson
              </BigButton>
            </section>
          )}

          {stage === "learn" && (
            <section style={styles.centerCol}>
              <h2 style={styles.h2}>Watch the light change</h2>
              <p style={styles.body}>
                Traffic lights always change in the same order: red, then green,
                then yellow, then back to red.
              </p>
              <TrafficLight active={demoColor} />
              <div
                style={{ ...styles.wordBadge, background: badgeColor(demoColor) }}
                aria-live="polite"
              >
                {LIGHT_INFO[demoColor].word}
              </div>
              <p style={styles.body}>{LIGHT_INFO[demoColor].desc}</p>

              <div style={styles.factBox}>
                <p style={styles.factLabel}>Fun fact</p>
                <p style={styles.factText}>{FUN_FACTS[factIndex]}</p>
                <button onClick={nextFact} style={styles.linkButton}>
                  Show another fact
                </button>
              </div>

              <BigButton onClick={() => setStageIndex(2)} color="#2EC4B6">
                Try it myself
              </BigButton>
            </section>
          )}

          {stage === "activity" && (
            <section style={styles.centerCol}>
              <h2 style={styles.h2}>Pick the right light</h2>
              <p style={styles.bodyStrong}>
                {activityScenarios[activityIndex].prompt}
              </p>
              <div style={styles.lightChoiceRow}>
                {["red", "yellow", "green"].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleActivityChoice(color)}
                    style={{
                      ...styles.colorChoice,
                      background: rawColor(color),
                    }}
                    aria-label={`Choose ${LIGHT_INFO[color].word}`}
                  >
                    {LIGHT_INFO[color].word}
                  </button>
                ))}
              </div>
              {activityFeedback && (
                <p
                  style={{
                    ...styles.feedback,
                    color: activityFeedback.correct ? "#0F6E56" : "#A32D2D",
                  }}
                  aria-live="assertive"
                >
                  {activityFeedback.correct
                    ? "That's right! Great choice."
                    : "Not quite - look at the words on each button and try again."}
                </p>
              )}
              <p style={styles.stepCounter}>
                Question {activityIndex + 1} of {activityScenarios.length}
              </p>
            </section>
          )}

          {stage === "quiz" && (
            <section style={styles.centerCol}>
              <h2 style={styles.h2}>Quick knowledge check</h2>
              <p style={styles.bodyStrong}>{QUIZ_QUESTIONS[quizIndex].q}</p>
              <div style={styles.quizOptions}>
                {QUIZ_QUESTIONS[quizIndex].options.map((opt, i) => {
                  const showState = quizFeedback && quizFeedback.optionIndex === i;
                  return (
                    <button
                      key={opt}
                      onClick={() => !quizFeedback && handleQuizChoice(i)}
                      style={{
                        ...styles.quizOption,
                        borderColor: showState
                          ? quizFeedback.correct
                            ? "#0F6E56"
                            : "#A32D2D"
                          : "#33363D",
                        background: showState
                          ? quizFeedback.correct
                            ? "#E1F5EE"
                            : "#FCEBEB"
                          : "#FFF8EC",
                      }}
                      disabled={!!quizFeedback}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              <p style={styles.stepCounter}>
                Question {quizIndex + 1} of {QUIZ_QUESTIONS.length} &nbsp;|&nbsp; Score: {quizScore}
              </p>
            </section>
          )}

          {stage === "success" && (
            <section style={styles.centerCol}>
              <div style={styles.badge}>★</div>
              <h2 style={styles.h2}>Great work, road safety explorer!</h2>
              <p style={styles.body}>
                You scored {quizScore} out of {QUIZ_QUESTIONS.length} on the quiz.
              </p>
              <p style={styles.body}>
                Remember: red means stop, yellow means wait, and green means go.
              </p>
              <BigButton onClick={restart} color="#2EC4B6">
                Play again
              </BigButton>
            </section>
          )}
        </main>

        <nav style={styles.stepDots} aria-label="Lesson progress">
          {STAGES.map((s, i) => (
            <span
              key={s}
              style={{
                ...styles.dot,
                background: i <= stageIndex ? "#2EC4B6" : "#D3D1C7",
              }}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

function rawColor(color) {
  return { red: "#E63946", yellow: "#FFC83D", green: "#2EC4B6" }[color];
}
function badgeColor(color) {
  return { red: "#F09595", yellow: "#FAC775", green: "#97C459" }[color];
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#5FAEFF",
    display: "flex",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
  },
  shell: {
    width: "100%",
    maxWidth: "480px",
  },
  header: { textAlign: "center", marginBottom: "8px", color: "#FFF8EC" },
  eyebrow: {
    margin: 0,
    fontSize: "14px",
    letterSpacing: "1px",
    fontWeight: "bold",
    opacity: 0.9,
  },
  title: { margin: "4px 0 16px", fontSize: "28px" },
  progressTrack: {
    height: "10px",
    background: "rgba(255,255,255,0.4)",
    borderRadius: "999px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#FFC83D",
    transition: "width 0.4s ease",
  },
  card: {
    background: "#FFF8EC",
    borderRadius: "20px",
    padding: "24px 20px",
    boxSizing: "border-box",
    minHeight: "420px",
  },
  centerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
  },
  h2: { margin: "4px 0", fontSize: "22px", color: "#2B2D33" },
  body: { margin: 0, fontSize: "17px", lineHeight: 1.5, color: "#2B2D33" },
  bodyStrong: {
    margin: 0,
    fontSize: "19px",
    lineHeight: 1.5,
    color: "#2B2D33",
    fontWeight: "bold",
  },
  bigButton: {
    minHeight: "52px",
    padding: "12px 28px",
    borderRadius: "999px",
    border: "none",
    color: "#FFF8EC",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "8px",
  },
  wordBadge: {
    display: "inline-block",
    padding: "8px 24px",
    borderRadius: "999px",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2B2D33",
  },
  factBox: {
    width: "100%",
    background: "#E6F1FB",
    borderRadius: "14px",
    padding: "12px 16px",
    boxSizing: "border-box",
    marginTop: "8px",
  },
  factLabel: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "bold",
    color: "#185FA5",
    textTransform: "uppercase",
  },
  factText: { margin: "6px 0", fontSize: "15px", color: "#2B2D33" },
  linkButton: {
    background: "none",
    border: "none",
    color: "#185FA5",
    fontSize: "14px",
    textDecoration: "underline",
    cursor: "pointer",
    padding: "8px 0",
    minHeight: "44px",
  },
  lightChoiceRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "8px",
  },
  colorChoice: {
    minWidth: "96px",
    minHeight: "64px",
    borderRadius: "16px",
    border: "3px solid #2B2D33",
    color: "#2B2D33",
    fontSize: "17px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  feedback: { fontSize: "17px", fontWeight: "bold" },
  stepCounter: { fontSize: "14px", color: "#5F5E5A", marginTop: "4px" },
  quizOptions: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
  },
  quizOption: {
    minHeight: "52px",
    padding: "10px 16px",
    borderRadius: "12px",
    border: "3px solid #2B2D33",
    fontSize: "16px",
    cursor: "pointer",
    textAlign: "left",
  },
  badge: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#FAC775",
    color: "#633806",
    fontSize: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "pop 0.4s ease",
  },
  stepDots: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "16px",
  },
  dot: { width: "10px", height: "10px", borderRadius: "50%" },
};