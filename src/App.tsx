import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="flex gap-4 mb-8">
        <a
          href="https://vite.dev"
          target="_blank"
          className="hover:opacity-80 transition-opacity"
        >
          <img src={viteLogo} className="logo h-24 w-24" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          className="hover:opacity-80 transition-opacity"
        >
          <img
            src={reactLogo}
            className="logo react h-24 w-24"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">
        Vite + React
      </h1>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-600 dark:text-gray-300">
          Edit{" "}
          <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">
            src/App.tsx
          </code>{" "}
          and save to test HMR
        </p>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-8 text-center max-w-md">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
