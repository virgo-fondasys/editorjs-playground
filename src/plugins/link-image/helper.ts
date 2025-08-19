export function makeElement<T = Element>(
  tagName: string,
  classNames: Array<string> = [],
  attributes: Record<string, unknown> = {}
): T {
  const element = document.createElement(tagName);

  if (classNames.length > 0) {
    element.classList.add(...classNames);
  }

  Object.keys(attributes).forEach((attrName) => {
    element.setAttribute(attrName, String(attributes[attrName]));
  });

  return element as T;
}

export function isUrl(url: string): boolean {
  const regex =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;
  return regex.test(url);
}
