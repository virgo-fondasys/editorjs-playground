import { ElementType } from "domelementtype";
import {
  Element,
  isTag,
  isText,
  Text,
  type ChildNode,
  type Document,
} from "domhandler";
import { stripCircular } from "./strip-circular";

export function processDOMTree(document: Document): Document {
  console.log("Processing DOM Tree:", stripCircular(document));

  // document is a root node, process its children
  document.children.forEach((child: ChildNode) => {
    console.log("Processing child:", child.type, child);
    manipulateRootChildren(child);
  });

  return document;
}

function manipulateRootChildren(node: ChildNode) {
  if (isText(node)) {
    //delete &nbsp; from
    node.data.replace(/&nbsp;/g, "").trim();
  }

  if (isTag(node)) {
    manipulateTagNode(node);
  }
}

function manipulateTagNode(node: Element) {
  if (node.name === "a") {
    // if tag no anchor get all text inside
    const textContent = node.children
      .map(getTextContent)
      .join("")
      .replace(/&nbsp;/g, "")
      .trim();

    // if textContent is empty remove the node
    if (textContent === "") {
      replaceNodeWithChildren(node);
      return;
    }

    node.children = [new Text(textContent)];
    console.log("Processed <a> tag, set text content:", node);
    return;
  }

  if (node.name === "span") {
    // If the span has no attributes, unwrap it
    if (!node.attribs || Object.keys(node.attribs).length === 0) {
      // Replace the span with its children
      replaceNodeWithChildren(node);
      return;
    }

    // If the span has style attribute, check if it's empty
    if (!node.attribs.style || node.attribs.style.trim() === "") {
      replaceNodeWithChildren(node);
      return;
    }

    const style = node.attribs.style.trim();

    // if the  style is not empty split by ; and then by : and make an object with key value pairs
    const styleMap = styleStringToMap(style);
    console.log("Parsed style map:", styleMap);

    // if the style contains font-weight check if it's >700 or not
    const fontWeight = styleMap.get("font-weight") || ""; // either 400 or 700
    const fontStyle = styleMap.get("font-style") || ""; // either normal or italic
    const textDecoration = styleMap.get("text-decoration") || ""; // neither underline nor line-through

    let textContent = node.children
      .map(getTextContent)
      .join("")
      .replace(/&nbsp;/g, "")
      .trim();

    // if textContent is empty remove the node
    if (textContent === "") {
      replaceNodeWithChildren(node);
      return;
    }

    if (isFontWeightBold(fontWeight)) {
      textContent = `<b>${textContent}</b>`;
    }

    if (isFontStyleItalic(fontStyle)) {
      textContent = `<i>${textContent}</i>`;
    }

    if (isTextDecorationUnderline(textDecoration)) {
      textContent = `<u class="cdx-underline">${textContent}</u>`;
    }

    if (isTextDecorationLineThrough(textDecoration)) {
      textContent = `<s class="cdx-strikethrough">${textContent}</s>`;
    }

    console.log("Final text content after styles:", textContent);
    // remove all children and set textContent as the only child
    node.children = [new Text(textContent)];

    replaceNodeWithChildren(node);
    return;
  }
}

function getTextContent(node: ChildNode): string {
  if (isText(node)) {
    return node.data;
  }

  if (isTag(node)) {
    return node.children.map(getTextContent).join("");
  }

  return "";
}

function replaceNodeWithChildren(node: Element) {
  const parent = node.parent;
  if (!parent) {
    return;
  }

  const index = parent.children.indexOf(node);
  if (index === -1) {
    return;
  }

  // If the node has no children, just remove it
  if (node.children.length === 0) {
    parent.children.splice(index, 1);
    console.log("Removed empty node:", node);
    return;
  }

  // Find the index of the node in its parent's children array
  // change domtree like <span>a;wefkwefawf</span> to a;wefkwefaff
  parent.children.splice(index, 1, ...node.children);
  node.children.forEach((child) => {
    child.parent = parent;
  });
  console.log("Unwrapped <span>:", node);
}

function styleStringToMap(styleString: string): Map<string, string> {
  const styleMap = new Map();

  styleString
    .split(";")
    .filter(Boolean)
    .forEach((rule) => {
      const [property, value] = rule.split(":").map((s) => s.trim());
      if (!property || !value) return;
      styleMap.set(property, value); // overwrite like CSS cascade
    });

  return styleMap;
}

function isFontWeightBold(fontWeight: string): boolean {
  if (!fontWeight) return false;

  const weight = parseInt(fontWeight);
  return !isNaN(weight) && weight >= 700;
}

function isFontStyleItalic(fontStyle: string): boolean {
  if (!fontStyle) return false;

  return fontStyle.toLowerCase() === "italic";
}

function isTextDecorationUnderline(textDecoration: string): boolean {
  if (!textDecoration) return false;
  return textDecoration.toLowerCase().includes("underline");
}

function isTextDecorationLineThrough(textDecoration: string): boolean {
  if (!textDecoration) return false;
  return textDecoration.toLowerCase().includes("line-through");
}

export function domTreeToString(document: Document): string {
  const string = document.children
    .map((child) => {
      if (isText(child)) {
        return child.data;
      } else if (isTag(child)) {
        return renderElementToString(child);
      }
      return "";
    })
    .join("");

  return string;
}

function renderElementToString(element: Element): string {
  const tagName = element.name;
  const attributes = Object.entries(element.attribs || {})
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  const openingTag = attributes ? `<${tagName} ${attributes}>` : `<${tagName}>`;
  const closingTag = `</${tagName}>`;
  const childrenString = element.children
    .map((child) => {
      if (isText(child)) {
        return child.data;
      } else if (isTag(child)) {
        return renderElementToString(child);
      }
      return "";
    })
    .join("");

  return `${openingTag}${childrenString}${closingTag}`;
}
