export function stripCircular(node: any): any {
  if (!node || typeof node !== "object") return node;

  const clean: any = {};
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (["parent", "next", "prev"].includes(key)) {
      clean[key] = value ? "Circular Reference" : null;
    } else if (Array.isArray(value)) {
      clean[key] = value.map(stripCircular);
    } else if (typeof value === "object") {
      clean[key] = stripCircular(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}
