import { useState, useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { BlockMutationEvent, OutputData } from "@editorjs/editorjs";
import RawTool from "@editorjs/raw";
import "./plugins/link-image/link-image.css";
import LinkImage from "./plugins/link-image/link-image";
import isEqual from "lodash/isEqual";
import "./plugins/shopping-card/shopping-card.css";
import ShoppingCard from "./plugins/shopping-card/shopping-card";
import Quote from "@editorjs/quote";
import Header from "@editorjs/header";
import Delimiter from "@editorjs/delimiter";
import EditorjsList from "@editorjs/list";
import AudioPlayer from "editorjs-audio-player";
import Table from "@editorjs/table";
import Strikethrough from "@sotaproject/strikethrough";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import AlignmentTuneTool from "editorjs-text-alignment-blocktune";
import CallToActionAlert from "./plugins/call-to-action-alert/call-to-action-alert";

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
          shoppingCard: {
            class: ShoppingCard,
          },
          quote: Quote,
          header: Header,
          delimiter: Delimiter,
          embedss: {
            class: Embed,
            inlineToolbar: true,
            config: {
              services: {
                youtube: true, // Enable YouTube embeds
                instagram: true, // Enable Instagram embeds
                // Add other services as needed
              },
            },
          },
          list: {
            class: EditorjsList,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          audioPlayer: AudioPlayer,
          table: Table,
          strikethrough: Strikethrough,
          underline: Underline,
          alignmentTune: {
            class: AlignmentTuneTool,
          },
          ctaAlert: CallToActionAlert,
        },
        async onChange(
          api: EditorJS.API,
          event: BlockMutationEvent | BlockMutationEvent[]
        ) {
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

      editorRef.current.isReady
        .then(() => {
          console.log("Editor.js is ready to work!");
        })
        .catch((reason) => {
          console.log(`Editor.js initialization failed because of ${reason}`);
        });
    }

    // Cleanup function
    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleCopyJson = () => {
    if (!savedData) return;
    const jsonStr = JSON.stringify(savedData, null, 2);
    navigator.clipboard.writeText(jsonStr).then(
      () => {
        alert("JSON copied to clipboard!");
      },
      () => {
        alert("Failed to copy JSON");
      }
    );
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
            {/* Copy buttons */}
            <button
              onClick={handleCopyJson}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Copy Json
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
      {/* Render the editor results */}
    </div>
  );
}

export default App;
