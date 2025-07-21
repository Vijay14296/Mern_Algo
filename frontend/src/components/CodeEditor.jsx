import React, { useState } from "react";
import API from "../services/api";

const CodeEditor = ({ problemId, problem }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [verdict, setVerdict] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    try {
      const res = await API.post("/judge/submit", {
        code,
        language,
        problemId,
      });
      setResults(res.data.results);
      setVerdict(res.data.verdict);
    } catch (err) {
      console.error("Error running code:", err);
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <div className="mb-4">
        <label className="block mb-1 font-semibold">Choose Language:</label>
        <select
          className="p-2 border rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>
      </div>

      <label className="block mb-1 font-semibold">Your Code:</label>
      <textarea
        className="w-full h-64 p-3 font-mono border rounded resize-none focus:outline-none focus:ring focus:border-blue-300"
        placeholder="# Write your code here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
        onClick={runCode}
        disabled={loading}
      >
        {loading ? "Running..." : "Run Code"}
      </button>

      {verdict && (
        <div
          className={`mt-6 p-4 rounded font-bold text-white ${
            verdict === "Accepted" ? "bg-green-600" : "bg-gray-800"
          }`}
        >
          Verdict: {verdict} {verdict === "Accepted" ? "✅" : "❌"}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Test Case Results:</h3>
          <div className="space-y-4">
            {results.map((res, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border whitespace-pre-wrap break-words text-sm ${
                  res.passed
                    ? "bg-green-100 border-green-400"
                    : "bg-red-100 border-red-400"
                }`}
              >
                <div className="mb-2">
                  <span className="font-semibold">Input:</span>
                  <pre className="bg-white p-2 rounded">{res.input}</pre>
                </div>

                <div className="mb-2">
                  <span className="font-semibold">Expected Output:</span>
                  <pre className="bg-white p-2 rounded">{res.expectedOutput}</pre>
                </div>

                <div className="mb-2">
                  <span className="font-semibold">Your Output:</span>
                  <pre className="bg-white p-2 rounded">{res.actualOutput}</pre>
                </div>

                {res.error && (
                  <div className="mb-2">
                    <span className="font-semibold text-red-700">Error:</span>
                    <pre className="bg-red-200 text-red-900 p-2 rounded">
                      {res.error}
                    </pre>
                  </div>
                )}

                <div className="font-semibold">
                  Status:{" "}
                  <span
                    className={
                      res.passed ? "text-green-700" : "text-red-700"
                    }
                  >
                    {res.passed ? "Passed ✅" : "Failed ❌"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
