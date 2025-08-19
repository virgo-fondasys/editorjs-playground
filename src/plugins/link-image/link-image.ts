import type { API, BlockToolConstructorOptions } from "@editorjs/editorjs";
import { makeElement } from "./helper";

interface LinkImageData {
  url: string;
  caption: string;
  size: string;
}

export class LinkImage {
  private _imageSizes: string[] = [
    "XS",
    "SM",
    "MDP",
    "MDL",
    "LGP",
    "LGL",
    "XL",
  ];

  private _data: LinkImageData;

  private _wrapper: HTMLDivElement | undefined;

  private api: API;

  constructor({ data, api }: BlockToolConstructorOptions) {
    this._data = {
      url: data.url || "",
      caption: data.caption || "",
      size: data.size || "",
    };

    this.api = api;

    this._wrapper = undefined;
  }

  static get toolbox() {
    return {
      title: "Link Image",
      icon: '<svg width="12" height="12" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }

  render() {
    this._wrapper = makeElement<HTMLDivElement>("div", ["link-image"]);

    if (this._data.url) {
      this._showImage(
        this._data.url,
        this._data.caption || "",
        this._data.size || ""
      );
      return this._wrapper;
    }

    this._showImageInput();

    return this._wrapper;
  }

  save(wrapper: HTMLDivElement): LinkImageData {
    const image = wrapper.querySelector("img") as HTMLImageElement;
    const caption = wrapper.querySelector(
      "#link-image__caption-input"
    ) as HTMLInputElement;
    const size = wrapper.querySelector(
      "#link-image__size-input"
    ) as HTMLSelectElement;

    if (!image) {
      return { url: "", caption: "", size: "" };
    }

    // Sanitize the caption to prevent XSS attacks
    // Only allow basic HTML tags like <b>, <i>, and <a> with href attribute
    const sanitizerConfig = {
      b: true,
      a: {
        href: true,
      },
      i: true,
    };

    return {
      url: image.src || "",
      caption: this.api.sanitizer.clean(caption?.value || "", sanitizerConfig),
      size: size?.value || "",
    };
  }

  validate(savedData: LinkImageData) {
    if (!savedData.url || savedData.url.trim() === "") {
      return false;
    }

    return true;
  }

  private _showImageInput() {
    const input = makeElement<HTMLInputElement>(
      "input",
      ["link-image__image-input"],
      {
        type: "text",
        placeholder: "Enter image URL",
        value: this._data && this._data.url ? this._data.url : "",
      }
    );

    const button = makeElement<HTMLButtonElement>(
      "button",
      ["link-image__submit-button"],
      {
        type: "button",
      }
    );
    button.innerHTML = "Add";

    button.addEventListener("click", () => {
      const url = input.value.trim();
      if (url) {
        this._showImage(url);
      }
    });

    this._wrapper?.appendChild(input);
    this._wrapper?.appendChild(button);
  }

  private _showImage(url: string, captionText: string = "", size: string = "") {
    if (!this._wrapper) return;
    console.log("Showing image:", url, captionText, size);
    // create an image element
    const img = makeElement<HTMLImageElement>("img", [], { src: url });

    const caption = makeElement<HTMLInputElement>("input", [], {
      id: "link-image__caption-input",
      type: "text",
      placeholder: "Caption for the image",
      value: captionText,
    });

    const selectSizes = makeElement<HTMLSelectElement>("select", [], {
      id: "link-image__size-input",
    });

    this._imageSizes.forEach((sizes) => {
      const option = makeElement<HTMLOptionElement>("option", [], {
        value: sizes,
        selected: size === sizes,
      });
      option.textContent = sizes;
      selectSizes.appendChild(option);
    });

    // append the image and caption to the wrapper
    this._wrapper.innerHTML = ""; // clear previous content
    this._wrapper.appendChild(img);
    this._wrapper.appendChild(caption);
    this._wrapper.appendChild(selectSizes);
  }
}
