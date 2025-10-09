import type {
  API,
  BlockToolConstructorOptions,
  OutputData,
} from "@editorjs/editorjs";
import { serializeHtmlToEditorjsFormat } from "../helper/editorjs-serializer";
import { convertMarkdownToHtml } from "../helper/markdown-to-html";

type CustomHtmlToolData = {
  html: string;
};

type CustomHtmlToolConstructorOptions =
  BlockToolConstructorOptions<CustomHtmlToolData>;

export class CustomHtmlTool {
  private _data: CustomHtmlToolData;

  private api: API;

  constructor({ data, api }: CustomHtmlToolConstructorOptions) {
    this._data = { html: data?.html || "" };
    this.api = api;
  }

  static get toolbox() {
    return {
      title: "Custom HTML",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-xml-icon lucide-code-xml"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>',
    };
  }

  render(): HTMLElement {
    const input = document.createElement("textarea");
    input.placeholder = "Enter custom HTML";
    input.style.width = "100%";
    input.style.minHeight = "250px";

    // add event listener for paste event
    input.addEventListener("paste", (event) => {
      console.log("Paste event:", event);
      const value =
        // event.clipboardData?.getData("text/html") ||
        event.clipboardData?.getData("text/plain") || "";
      console.log("Pasted content:", value);

      if (!value) {
        return;
      }

      const serialiazed = serializeHtmlToEditorjsFormat(value);
      console.log("Serialized content:", serialiazed);

      const blocks = serialiazed.blocks || [];
      const currentBlockIndex = this.api.blocks.getCurrentBlockIndex();
      console.log("Current block index:", currentBlockIndex);

      if (blocks.length < 0) {
        return;
      }

      blocks.forEach((block) => {
        this.api.blocks.insert(block.type, block.data, {});
      });

      // remove the current block
      this.api.blocks.delete(currentBlockIndex);
      event.preventDefault();
    });

    return input;
  }
}
