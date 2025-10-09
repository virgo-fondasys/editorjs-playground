import type { HTMLPasteEvent, PasteConfig } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import {
  domTreeToString,
  processDOMTree,
} from "../helper/dom-tree-manipulator";
import * as htmlparser2 from "htmlparser2";
import { stripCircular } from "../helper/strip-circular";

export class CustomParagraph extends Paragraph {
  // Define pasteConfig to handle specific paste types
  static get pasteConfig(): PasteConfig {
    console.log("CustomParagraph pasteConfig");
    return {
      tags: [
        "p",
        "div",
        "a",
        { span: { style: true } },
        { b: { style: true } },
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
    };
  }

  // Implement the onPaste method to customize paste behavior
  onPaste(event: HTMLPasteEvent): void {
    console.log("CustomParagraph onPaste called", event);

    // const data = event.detail.data.innerHTML.trim();
    // if (data === "") {
    //   console.log("Pasted empty text, ignoring");
    //   return;
    // }

    // console.log("Pasted data:", data);

    // const document = htmlparser2.parseDocument(data, {
    //   lowerCaseTags: true,
    //   lowerCaseAttributeNames: true,
    // });

    // const manipulatedChildren = processDOMTree(document);
    // console.log("Manipulated children:", stripCircular(manipulatedChildren));

    // // Convert manipulated children back to HTML string
    // const htmlString = domTreeToString(manipulatedChildren);
    // console.log("Final HTML string after manipulation:", htmlString);

    // // Update the event data with the new HTML
    // event.detail.data.innerHTML = htmlString;

    console.log("Event data after manipulation:", event.detail.data.innerHTML);

    super.onPaste(event);
  }
}
