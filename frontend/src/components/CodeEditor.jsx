import React, { useState, useEffect } from "react";
import API from "../services/api";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";

const languageExtensions = {
  python: python(),
  cpp: cpp(),
  java: java(),
};

// --- Gamification Toast ---
const GamificationToast = ({ gamification, onClose }) => {
  useEffect(() => {
    if (!gamification) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [gamification, onClose]);

  if (!gamification) return null;

  return (
    <div className="fixed top-5 right-5 bg-green-400 text-gray-900 font-bold px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300">
      🏆 XP: {gamification.xp ?? 0}, Badges: {gamification.badges?.length
        ? gamification.badges.map(b => `${b.icon} ${b.name}`).join(", ")
        : "None"}!
    </div>
  );
};

const CodeEditor = ({ problemId, problem, onRunComplete }) => {
  const [language, setLanguage] = useState("python");
  const [codeMap, setCodeMap] = useState({});
  const [results, setResults] = useState([]);
  const [verdict, setVerdict] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedCases, setExpandedCases] = useState({});
  const [aiReview, setAiReview] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [gamificationToast, setGamificationToast] = useState(null);

  // Initialize code from starterCode safely
  useEffect(() => {
    if (problem) {
      setCodeMap(prev => ({
        python: problem.starterCode?.python ?? prev.python ?? "",
        cpp: problem.starterCode?.cpp ?? prev.cpp ?? "",
        java: problem.starterCode?.java ?? prev.java ?? "",
      }));
    }
  }, [problem]);

  const code = codeMap[language] ?? "";

  const runCode = async () => {
    setLoading(true);
    setResults([]);
    setVerdict("");
    try {
      const res = await API.post("/code/submit", { code, language, problemId });

      const safeResults = res.data?.results ?? [];
      setResults(safeResults);
      setVerdict(res.data?.verdict ?? "Error");

      const newExpanded = {};
      safeResults.forEach((_, idx) => (newExpanded[idx] = false));
      setExpandedCases(newExpanded);

      // Show gamification toast if user earned XP or badges
      if (res.data?.gamification) setGamificationToast(res.data.gamification);

      if (onRunComplete)
        onRunComplete(code, res.data?.verdict, res.data?.gamification);
    } catch (err) {
      console.error("Error running code:", err);
      setResults([]);
      setVerdict("Error");
    }
    setLoading(false);
  };

  const requestAiReview = async () => {
    setAiLoading(true);
    setAiReview("");
    try {
      const res = await API.post("/ai/feedback", { problemId, code, language });
      setAiReview(res.data?.feedback ?? "No suggestions available.");
    } catch (err) {
      console.error("AI Review error:", err);
      setAiReview("Failed to get AI review.");
    }
    setAiLoading(false);
  };

  const toggleCase = idx => setExpandedCases(prev => ({ ...prev, [idx]: !prev[idx] }));
  const handleCodeChange = value => setCodeMap(prev => ({ ...prev, [language]: value }));

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700 p-4">
      {/* Language Selector */}
      <div className="mb-4 flex gap-2">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
        <button
          onClick={runCode}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded text-white"
        >
          {loading ? "Running..." : "Run Code"}
        </button>
        <button
          onClick={requestAiReview}
          disabled={aiLoading}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-1 rounded text-white"
        >
          {aiLoading ? "Reviewing..." : "AI Review"}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 mb-4">
        <CodeMirror
          value={code}
          height="400px"
          theme={oneDark}
          extensions={[languageExtensions[language]]}
          onChange={handleCodeChange}
        />
      </div>

      {/* AI Review */}
      {aiReview && (
        <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-lg mb-4 overflow-auto">
          <h3 className="text-lg font-semibold mb-2 text-white">AI Review:</h3>
          <pre className="bg-gray-900 p-2 rounded text-white whitespace-pre-wrap">{aiReview}</pre>
        </div>
      )}

      {/* Test Case Results */}
      {results.length > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-lg mb-4 overflow-auto">
          <h3 className="text-lg font-semibold mb-4 text-white">Test Case Results:</h3>
          {results.map((res, idx) => (
            <div key={idx} className="mb-2">
              <button
                onClick={() => toggleCase(idx)}
                className={`w-full text-left p-2 rounded ${
                  res.passed ? "bg-green-700" : "bg-red-700"
                } text-white font-semibold`}
              >
                Test Case {idx + 1} - {res.passed ? "Passed ✅" : "Failed ❌"}
                {res.hidden && " (Hidden)"}
              </button>

              {expandedCases[idx] && (
                <div className="mt-2 p-2 bg-gray-900 rounded">
                  <p>
                    <strong>Input:</strong>
                    <pre className="bg-gray-800 p-2 rounded text-white">{res.input ?? ""}</pre>
                  </p>

                  {!res.hidden && (
                    <>
                      <p>
                        <strong>Expected Output:</strong>
                        <pre className="bg-gray-800 p-2 rounded text-white">{res.expectedOutput ?? ""}</pre>
                      </p>
                      <p>
                        <strong>Your Output:</strong>
                        <pre className="bg-gray-800 p-2 rounded text-white">{res.actualOutput ?? ""}</pre>
                      </p>
                    </>
                  )}

                  {res.runtimeError && (
                    <p className="text-red-400">
                      <strong>Error:</strong> {res.runtimeError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gamification Toast */}
      {gamificationToast && (
        <GamificationToast
          gamification={gamificationToast}
          onClose={() => setGamificationToast(null)}
        />
      )}
    </div>
  );
};

export default CodeEditor;
