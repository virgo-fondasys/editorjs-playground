import type { HTMLPasteEventDetail, PasteEvent } from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";

export class CustomImageTool extends ImageTool {
  async onPaste(event: PasteEvent): Promise<void> {
    console.log("Custom onPaste called", event);
    // check if the pasted content is tag <img>
    if (event.type === "tag") {
      const imgElement = (event.detail as HTMLPasteEventDetail)
        .data as HTMLImageElement;
      const src = imgElement.src;
      console.log("Pasted image src:", src);

      // /^data:image\/(png|jpeg|jpg);base64,/.test(src)
      if (src.startsWith("data:image/")) {
        console.log("Handling base64 image paste");

        const base64Data = src.split(",")[1];

        // Convert base64 to Blob (browser-compatible)
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });

        // Create a File object from the blob
        const fileObject = new File([blob], `${Date.now()}.png`, {
          type: "image/png",
        });
        console.log("File object created:", fileObject);
        // Create a custom event with the file
        const customEvent = {
          ...event,
          detail: {
            file: fileObject,
          },
          type: "file",
        } as PasteEvent & { detail: HTMLPasteEventDetail & { file: File } };
        console.log("Custom event created:", customEvent);
        return super.onPaste(customEvent);
      }
    }

    return super.onPaste(event);
  }
}
