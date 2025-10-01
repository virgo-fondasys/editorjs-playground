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
        data: {
          time: 1758516175297,
          blocks: [
            {
              id: "OvU1lbSu2ZOmGy0S1bb4K",
              type: "paragraph",
              data: {
                text: 'Two mates, Matt Ford and Jack Steele, came up with the idea for <a target="_blank" href="https://www.instagram.com/theinspiredunemployed/?hl=en">the Inspired Unemployed</a> after spending time travelling and working as tradies in New Zealand. They were making videos and goofing around, and it turns out their suave dance moves and comedy takes on Australian culture was enough to tip them over into Instagram fame when they returned home.',
              },
            },
            {
              id: "5UqB3fuxiqn0uVBl3A2Hw",
              type: "paragraph",
              data: {
                text: "The lads are not dab hands in the kitchen – they can’t tell common groceries apart and prefer to use pesto from a jar than make their own. So celebrated chef Matt Moran is here to teach the self-professed battlers a few tips and tricks in the kitchen.",
              },
            },
            {
              id: "elzU4h8uclA9CLF_-vad3",
              type: "paragraph",
              data: {
                text: "In the second series of Moran’s cooking show <em>Kitchen Tales</em> , he invites Ford and Steele over for lunch to show them how to make fresh pesto pasta and parmesan- and panko-crumbed schnitties so good they’ll be inspired to cook it themselves one day.",
              },
            },
            {
              id: "HDC39ny1Y9PGomNFidA3P",
              type: "paragraph",
              data: {
                text: 'In Moran’s classic pub schnitzel recipe, he uses panko crumbs, rather than breadcrumbs, which he says are coarser. He also leaves the skin on the chicken breast for added flavour. And his tip is to use lemon juice to cut through the fattiness of the dish. He also stresses the importance of fresh parmesan and good, Australian salt, like <a href="https://www.broadsheet.com.au/sydney/food-and-drink/article/sydney-pantry-olssons-sea-salt">Olsson’s</a>.',
              },
            },
            {
              id: "PjNHyerpHPzHaEgAhkqkG",
              type: "paragraph",
              data: {
                text: "“This is actually food porn,” says Steele. “They say with good food, you don’t need sauce – and this doesn’t need sauce. I’d never pictured myself eating a schitty without sauce before in my life,” he says.",
              },
            },
            {
              id: "gzK8ITk7_cZ2S9lc8Iv04",
              type: "paragraph",
              data: {
                text: "Moran serves the schnitzel with a baby gem salad topped with a simple buttermilk dressing and a poached egg, which you can learn how to make on Moran’s Youtube show.",
              },
            },
            {
              id: "C86IYoFZm2znwX8TyEZm3",
              type: "paragraph",
              data: {
                text: "<b>Matt Moran’s parmesan-crumbed chicken schnitzel</b> <br /> <em>Serves 4</em> <br /> <em>Preparation time: 20 minutes</em> <br /> <em>Cooking time: 25–30 minutes</em>",
              },
            },
            {
              id: "3V6uvcgCJGHT-gywr8VIp",
              type: "paragraph",
              data: {
                text: "<em>Ingredients:</em> <br /> 4 chicken breasts <br /> 3 eggs",
              },
            },
            {
              id: "BZ1yobNmFYdphGmBwqnS_",
              type: "paragraph",
              data: {
                text: "350g panko breadcrumbs <br /> 100g parmesan, finely grated <br /> 150ml grapeseed oil <br /> 40g salted butter <br /> 1/4 bunch sage leaves, picked <br /> The juice of 1 lemon <br /> Sea salt <br /> Cracked black pepper",
              },
            },
            {
              id: "DdpZUBhaNiS0W7ZcosDvv",
              type: "paragraph",
              data: {
                text: "<em>Method:</em> <br /> Preheat the oven 190°C.",
              },
            },
            {
              id: "L6_s_NmH4k495eRI3vNX9",
              type: "paragraph",
              data: {
                text: "Using a knife, butterfly the chicken breast by cutting horizontally through the middle of the breast. Ensure you do not cut all the way through the breast meat, keeping the end intact so you can flatten out the chicken breast.",
              },
            },
            {
              id: "-L2pTKZ9nsCy6q3_daMZh",
              type: "paragraph",
              data: {
                text: "Place the eggs into a bowl and beat with a fork until broken down and combined. Season with salt and pepper.",
              },
            },
            {
              id: "wpiLjGnGxwORRm9HahvqA",
              type: "paragraph",
              data: {
                text: "In a separate bowl, place the breadcrumbs and mix with the grated parmesan cheese.",
              },
            },
            {
              id: "Y55YciLS9co2Dnu-7qFKD",
              type: "paragraph",
              data: {
                text: "Place the chicken breasts through the egg wash, allow any excess egg wash to drip off before placing the breasts through the breadcrumbs. Press the breadcrumbs firmly onto the chicken to ensure a good coating all over, place the crumbed chicken on a platter and repeat the process for the remaining chicken.",
              },
            },
            {
              id: "SuSJ_lAZ4zlfzBX4bdiYo",
              type: "paragraph",
              data: {
                text: "Place a large fry pan on a high heat and add the grapeseed oil. Once the oil is hot, place the crumbed chicken breast in the pan and cook for 6–8 minutes, until golden brown and crispy. Turn the breast and repeat on the following side.",
              },
            },
            {
              id: "byvYZfpMhnlZiB2864CGd",
              type: "paragraph",
              data: {
                text: "Place the pan into the preheated oven for 6–8 minutes, or until cooked through. Remove the pan from the oven. Return the fry pan to the cooktop or stove, this time at a medium heat with the butter and sage and baste the chicken. Add lemon juice.",
              },
            },
            {
              id: "K_Fh2n5qWtORt1B-JsmwK",
              type: "paragraph",
              data: {
                text: "Remove chicken from the pan and place onto a paper towel to drain excess oil. Season with salt before serving.",
              },
            },
            {
              id: "1GfhNKTkE1v6LM8mWSc_U",
              type: "paragraph",
              data: {
                text: '<em>Find</em> Kitchen Tales <em>on <a target="_blank" href="https://www.youtube.com/channel/UCmwXaXtQi-Lp5_1SYpIZTfQ">Matt Moran’s Youtube channel</a></em>.',
              },
            },
            {
              id: "-yyHfCjyGgMXOqYV-uup1",
              type: "paragraph",
              data: {
                text: '<em>Looking for more recipes? See</em> Broadsheet’s <em><a href="https://www.broadsheet.com.au/national/series/at-home-cook">recipe hub</a></em>.',
              },
            },
          ],
          version: "2.31.0-rc.7",
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
