import { marked } from "marked";

export function convertMarkdownToHtml(markdown: string): string {
  // Normalize to fix issues when the markdown have "##Text" without space
  const normalized = markdown.replace(
    /^(\s{0,3})(#{1,6})([^\s#])/gm,
    "$1$2 $3"
  );

  const html = marked.parse(normalized, {
    async: false,
    breaks: false,
    extensions: null,
    gfm: true,
    hooks: null,
    pedantic: false,
    silent: false,
    tokenizer: null,
    walkTokens: null,
  });
  console.log("Converted HTML:", html);
  return html;
}
