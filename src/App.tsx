import { useState, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";
import RawTool from "@editorjs/raw";
import "./plugins/link-image/link-image.css";
import LinkImage from "./plugins/link-image/link-image";
import isEqual from "lodash/isEqual";
import SelectMenu from "./plugins/select/select";

function App() {
  const editorRef = useRef<EditorJS | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [savedData, setSavedData] = useState<OutputData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize Editor.js
    if (editorContainerRef.current && !editorRef.current) {
      editorRef.current = new EditorJS({
        holder: editorContainerRef.current,
        placeholder: "Start writing your content here...",
        tools: {
          html: {
            class: RawTool,
          },
          linkimage: {
            class: LinkImage,
          },
          selectMenu: {
            class: SelectMenu,
          },
        },
        data: {
          time: 1552744582955,
          blocks: [
            {
              type: "linkimage",
              data: {
                url: "https://cdn.pixabay.com/photo/2017/09/01/21/53/blue-2705642_1280.jpg",
                caption: "A beautiful blue image",
                size: "LGL", // TODO: have a problem, the select default value is not working
              },
            },
          ],
          version: "2.11.10",
        },
        onReady: () => {
          console.log("Editor.js is ready to work!");
        },
        async onChange(api, event) {
          console.log("Editor content changed:", event);
          const result: EditorJS.OutputData = await api.saver.save();

          if (!result || result.blocks.length < 1) {
            return;
          }

          console.log("Saved content:", result);
          if (!isEqual(savedData, result)) {
            console.log("Old content:", savedData);
            setSavedData(result);
          }
        },
      });
    }

    // Cleanup function
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleSave = async () => {
    if (!editorRef.current) return;

    setIsLoading(true);
    try {
      const outputData = await editorRef.current.save();
      setSavedData(outputData);
      console.log("Article data:", outputData);
    } catch (error) {
      console.error("Saving failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!editorRef.current) return;

    try {
      await editorRef.current.clear();
      setSavedData(null);
      console.log("Editor cleared");
    } catch (error) {
      console.error("Clearing failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Editor.js Playground
        </h1>

        {/* Editor Container */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Content Editor
            </h2>
            <div
              ref={editorContainerRef}
              className="min-h-[300px] border border-gray-200 rounded-lg p-4"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 pt-0">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              {isLoading ? "Saving..." : "Save Content"}
            </button>
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Clear Editor
            </button>
          </div>
        </div>

        {/* JSON Output */}
        {savedData && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Saved Content (JSON)
              </h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                <code className="text-gray-800">
                  {JSON.stringify(savedData, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
