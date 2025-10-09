import {
  Document,
  Element,
  isCDATA,
  isDirective,
  isTag,
  isText,
  Text,
  type ChildNode,
} from "domhandler";
import * as htmlparser2 from "htmlparser2";
import { nanoid } from "nanoid";
import { stripCircular } from "./strip-circular";
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";

let slugForLogging: string | undefined = undefined;

export function serializeHtmlToEditorjsFormat(
  html: string,
  slug?: string
): OutputData {
  slugForLogging = slug;

  // before parsing html, replace all <br> and </br> tags that are not <br/> or <br />
  html = html.replace(/<br(\s*\/?)>/gi, "<br/>");
  html = html.replace(/<\/br>/gi, "<br/>");

  const document: Document = htmlparser2.parseDocument(html, {
    lowerCaseTags: true,
    lowerCaseAttributeNames: true,
  });

  sanitizeDocument(document);
  clearLineBreaks(document);

  console.info(`${slugForLogging}`, {
    sanitizedDocument: stripCircular(document),
  });
  return serializedDocument(document);
}

function serializedDocument(document: Document): OutputData {
  const blocks: OutputBlockData[] = [];

  document.children.forEach((node: ChildNode) => {
    const block = convertNodeToBlock(node);
    if (block) {
      blocks.push(block);
    }
  });

  return {
    time: new Date().getTime(),
    blocks,
    version: "2.31.0-rc.7",
  };
}

function convertNodeToBlock(node: ChildNode): OutputBlockData | null {
  const block: OutputBlockData = {
    id: nanoid(),
    type: "",
    data: {},
  };

  if (isText(node)) {
    return convertTextNodeToBlockParagraph(node, block);
  }

  if (isTag(node)) {
    return convertTagNodeToBlock(node as Element, block);
  }

  return null;
}

function convertTextNodeToBlockParagraph(
  node: Text,
  block: OutputBlockData
): OutputBlockData | null {
  const trimmedData = node.data.trim();
  if (!trimmedData || /^\s*$/.test(trimmedData)) {
    return null;
  }

  block.data.text = trimmedData.replace(/\s+/g, " "); // Normalize whitespace
  block.type = getBlockType("p");
  return block;
}

function convertTagNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData | null {
  block.type = getBlockType(node.name);
  if (block.type === "unknown") {
    logBlockError(node);
    return block;
  }

  if (node.name === "table") {
    return processTableNodeToBlock(node, block);
  }

  if (node.name === "ol" || node.name === "ul") {
    return processListNodeToBlock(node, block, node.name === "ol");
  }

  if (node.name === "p") {
    return processParagraphNodeToBlock(node, block);
  }

  if (node.name.match(/^h[1-6]$/)) {
    return processHeaderNodeToBlock(node, block);
  }

  if (node.name === "div") {
    if (
      node.children.length === 1 &&
      isTag(node.children[0]) &&
      node.children[0].name === "table"
    ) {
      return convertTagNodeToBlock(node.children[0] as Element, block);
    }

    return processDivNodeToBlock(node, block);
  }

  if (node.name === "script") {
    return processScriptNodeToBlock(node, block);
  }

  if (node.name === "iframe") {
    return processIframeNodeToBlock(node, block);
  }

  if (node.name === "object") {
    return processObjectNodeToBlock(node, block);
  }

  if (node.name === "blockquote") {
    return processBlockquoteNodeToBlock(node, block);
  }

  if (node.name === "noscript") {
    return processNoScriptNodeToBlock(node, block);
  }

  if (node.name === "pre") {
    return processPreNodeToBlock(node, block);
  }

  if (node.name === "form") {
    return processFormNodeToBlock(node, block);
  }

  if (node.name === "style") {
    return processStyleNodeToBlock(node, block);
  }

  return block;
}

type ListItem = {
  content: string;
  meta: Record<string, unknown>;
  items: ListItem[];
};

function processListNodeToBlock(
  node: Element,
  block: OutputBlockData,
  ordered: boolean
): OutputBlockData {
  const items: ListItem[] = getListItem(node);

  block.data.style = ordered ? "ordered" : "unordered";
  block.data.meta = {};
  block.data.items = items;
  return block;
}

function getListItem(listNode: Element): ListItem[] {
  if (!listNode || !listNode.children) {
    return [];
  }

  return listNode.children
    .filter((child) => isTag(child) && child.name === "li")
    .map((liNode) => processListItem(liNode as Element));
}

function processListItem(liNode: Element): ListItem {
  let content = "";
  let nestedItems: ListItem[] = [];

  for (const child of liNode.children) {
    if (isText(child)) {
      content += child.data.trim();
    }

    if (isTag(child) && child.name !== "ol" && child.name !== "ul") {
      content += getNodeText(child as Element);
    }

    if (isTag(child) && (child.name === "ol" || child.name === "ul")) {
      // If a nested list is found, process it recursively
      nestedItems = nestedItems.concat(getListItem(child));
    }
  }

  return {
    content: content.trim(),
    meta: {},
    items: nestedItems,
  };
}

function processParagraphNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  if (node.children.length === 1 && isTag(node.children[0])) {
    if (node.children[0].name === "img") {
      block.type = getBlockType("image");

      const imageAttributes = node.children[0].attribs || {};

      block.data.url = imageAttributes.src || "";
      block.data.caption = imageAttributes.alt || "";
      // fm-img-lgl -> split by '-' and get the size which is the third part and convert it to uppercase
      block.data.size = imageAttributes.variant
        ? imageAttributes.variant.split("-")[2].toUpperCase()
        : "LGL";
      return block;
    }

    if (node.children[0].name === "audio") {
      block.type = getBlockType("audio");

      const audioAttributes = node.children[0].attribs || {};
      block.data.src = audioAttributes.src || "";

      return block;
    }
  }

  const text = getNodeText(node);
  if (text.trim()) {
    block.data.text = text;
  }

  return block;
}

function processHeaderNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const text = getNodeText(node);
  if (text.trim()) {
    block.data.text = text;
  }
  block.data.level = getHeaderLevel(node.name);
  return block;
}

function processNoScriptNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<noscript ${attributesStr}>${getNodeText(
    node
  )}</noscript>`;
  return block;
}

function processBlockquoteNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<blockquote ${attributesStr}>${getNodeText(
    node
  )}</blockquote>`;
  return block;
}

function processDivNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<div ${attributesStr}>${getNodeText(node)}</div>`;
  return block;
}

function processScriptNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<script ${attributesStr}>${getNodeText(node)}</script>`;
  return block;
}

function processIframeNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<iframe ${attributesStr}></iframe>`;
  return block;
}

function processObjectNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<object ${attributesStr}>${getNodeText(node)}</object>`;
  return block;
}

function processPreNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<pre ${attributesStr}>${getNodeText(node)}</pre>`;
  return block;
}

function processFormNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<form ${attributesStr}>${getNodeText(node)}</form>`;
  return block;
}

function processStyleNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const attributesStr = formatAttributes(node.attribs || {});
  block.data.code = `<style ${attributesStr}>${getNodeText(node)}</style>`;
  return block;
}

function processTableNodeToBlock(
  node: Element,
  block: OutputBlockData
): OutputBlockData {
  const rows: string[][] = [];

  node.children.forEach((child) => {
    if (isTag(child) && child.name === "thead") {
      const thead = child as Element;
      thead.children.forEach((child) => {
        if (isText(child)) return;

        const rowCells = processTableRow(child as Element);
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      });

      block.data.withHeadings = true;
    }

    if (isTag(child) && child.name === "tbody") {
      const tbody = child as Element;
      tbody.children.forEach((child) => {
        if (isText(child)) return;

        const rowCells = processTableRow(child as Element);
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      });
    }

    if (isTag(child) && child.name === "tfoot") {
      const tfoot = child as Element;
      tfoot.children.forEach((child) => {
        if (isText(child)) return;

        const rowCells = processTableRow(child as Element);
        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      });
    }

    if (
      isTag(child) &&
      child.name !== "thead" &&
      child.name !== "tbody" &&
      child.name !== "tfoot"
    ) {
      const rowCells = processTableRow(child as Element);
      if (rowCells.length > 0) {
        rows.push(rowCells);
      }
    }
  });

  block.data.content = rows;
  block.data.stretched = false;
  block.data.withHeadings = block.data.withHeadings || false;

  return block;
}

function processTableRow(rowNode: Element): string[] {
  const cells: string[] = [];

  rowNode.children.forEach((cellNode) => {
    if (isTag(cellNode) && (cellNode.name === "td" || cellNode.name === "th")) {
      const cellText = getNodeText(cellNode as Element).trim();
      cells.push(cellText);
    }
  });

  return cells;
}

function formatAttributes(attributes: Record<string, string>): string {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  return attrs ? ` ${attrs}` : ""; // Add a space if there is attributes
}

function getNodeText(node: Element): string {
  const textParts: string[] = [];

  node.children.forEach((child: ChildNode) => {
    if (isText(child)) {
      const text = child.data.trim();
      if (text) {
        textParts.push(text);
      }
    }

    if (isCDATA(child)) {
      const text = getNodeText(child as unknown as Element);
      if (text) {
        textParts.push(text);
      }
    }

    if (isTag(child)) {
      const text = processTagInText(child as Element);
      if (text) {
        textParts.push(text);
      }
    }

    if (isDirective(child)) {
      textParts.push(`<!${child.data}>`);
    }

    // log if it's not text or tag or cdata - this is to catch any unknown types
    if (
      !isText(child) &&
      !isTag(child) &&
      !isCDATA(child) &&
      !isDirective(child)
    ) {
      console.error(
        `${slugForLogging} --- Unknown child type in getNodeText: ${
          child.type
        } for tag: ${node.name} with attributes: ${JSON.stringify(
          node.attribs
        )}`
      );
    }
  });

  // join the text with a single space and also replace multiple spaces with a single space, and then if there are a dot character that followed by a space like " ."
  // then remove the space before the dot so it becomes "."
  return textParts.join(" ").replace(/\s+/g, " ").replace(/\s+\./g, ".");
}

function processTagInText(child: Element): string {
  const TAG_MAPPING: Record<string, string> = {
    i: "i",
    b: "b",
    u: "u",
    s: "s",
    strong: "b",
    em: "i",
  };

  const attributes = child.attribs || {};
  const tagName = child.name.toLowerCase();

  if (tagName === "a") {
    return `<a href="${attributes.href || "#"}">${getNodeText(child)}</a>`;
  }

  if (tagName === "s" || tagName === "strike" || tagName === "del") {
    return `<s class="cdx-strikethrough">${getNodeText(child)}</s>`;
  }

  if (tagName === "u" || tagName === "ins") {
    return `<u class="cdx-underline">${getNodeText(child)}</u>`;
  }

  if (tagName in TAG_MAPPING) {
    const mappedTag = TAG_MAPPING[tagName];

    return `<${mappedTag}>${getNodeText(child)}</${mappedTag}>`;
  }

  // if the tag is unknown, just get its text content
  logTagError(tagName, attributes);
  return getNodeText(child);
}

function logTagError(
  tagName: string,
  attributes: Record<string, string>
): void {
  console.error(
    `${slugForLogging} --- Unknown tag in get text: ${tagName} with attributes: ${JSON.stringify(
      attributes
    )}`
  );
}

function logBlockError(node: Element): void {
  console.error(
    `${slugForLogging} --- Unknown block type for tag: ${
      node.name
    } with attributes: ${JSON.stringify(node.attribs)}`
  );
}

function getBlockType(tagName: string): string {
  switch (tagName.toLowerCase()) {
    case "p":
      return "paragraph";
    case "h1":
      return "header";
    case "h2":
      return "header";
    case "h3":
      return "header";
    case "h4":
      return "header";
    case "h5":
      return "header";
    case "h6":
      return "header";
    case "ul":
      return "list";
    case "ol":
      return "list";
    case "div":
      return "code";
    case "script":
      return "code";
    case "iframe":
      return "code";
    case "blockquote":
      return "code";
    case "object":
      return "code";
    case "link-image":
      return "linkImage";
    case "hr":
      return "delimiter";
    case "noscript":
      return "code";
    case "pre":
      return "code";
    case "audio":
      return "audioPlayer";
    case "table":
      return "table";
    case "form":
      return "code";
    case "style":
      return "code";
    case "img":
    default:
      return "unknown";
  }
}

function getHeaderLevel(tagName: string): number {
  const match = tagName.match(/^h(\d)$/);
  return match ? parseInt(match[1], 10) : 1;
}

const BLOCK_LEVEL_ELEMENTS = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "details",
  "dialog",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "ul",
]);

function isBlockLevel(node: ChildNode): node is Element {
  return isTag(node) && BLOCK_LEVEL_ELEMENTS.has(node.tagName);
}

function sanitizeDocument(currentNode: ChildNode): void {
  if (!("children" in currentNode)) {
    return;
  }

  // Use flatMap to easily replace a single child with multiple new children.
  // We iterate over a copy of the children array to avoid modification issues.
  currentNode.children = currentNode.children.flatMap((child) => {
    sanitizeDocument(child);

    // Now, check if the current child is a <p> tag that needs splitting.
    if (isTag(child) && child.tagName === "p") {
      // if have tag called br, and have a remove it
      child.children = child.children.filter((c) => {
        if (isTag(c) && c.tagName === "br" && c.children.length > 0) {
          return false;
        }

        return true;
      });

      const hasInvalidChild = child.children.some(isBlockLevel);

      if (hasInvalidChild) {
        // This is the invalid <p> tag. We need to split it.
        const newSiblings: (Element | Text)[] = [];
        let currentPChildren: ChildNode[] = [];

        for (const grandchild of child.children) {
          if (isBlockLevel(grandchild)) {
            // When we find a block-level element:
            // 1. If we have collected any inline children, wrap them in a new <p> tag.
            if (currentPChildren.length > 0) {
              const newP = new Element("p", {}, currentPChildren);
              // Set parent references for the moved children
              currentPChildren.forEach((c) => (c.parent = newP));
              newSiblings.push(newP);
              currentPChildren = []; // Reset for the next batch.
            }

            // 2. Add the block-level element itself as a sibling.
            newSiblings.push(grandchild);
          } else {
            // 3. It's an inline element (text, <a>, <span>, etc.), so collect it.
            currentPChildren.push(grandchild);
          }
        }

        // After the loop, if there are any remaining inline children, wrap them in a final <p> tag.
        if (currentPChildren.length > 0) {
          const finalP = new Element("p", {}, currentPChildren);
          currentPChildren.forEach((c) => (c.parent = finalP));
          newSiblings.push(finalP);
        }

        // Update parent references for the new top-level nodes
        newSiblings.forEach((s) => (s.parent = currentNode));

        // Return the new list of nodes to replace the original invalid <p>.
        return newSiblings;
      }
    }

    return [child];
  });
}

function clearLineBreaks(node: ChildNode): void {
  if (!("children" in node)) {
    return;
  }

  node.children = node.children.filter((child) => {
    if (isText(child)) {
      return child.data.trim() !== "";
    }
    return true;
  });

  node.children.forEach(clearLineBreaks);
}
