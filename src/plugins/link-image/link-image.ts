import type {
  API,
  BlockAPI,
  BlockToolConstructorOptions,
} from "@editorjs/editorjs";
import { makeElement } from "../helper/helper";
import debounce from "lodash/debounce";

interface LinkImageData {
  url: string;
  caption: string;
  size: string;
}

export default class LinkImage {
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

  private block: BlockAPI;

  constructor({ data, api, block }: BlockToolConstructorOptions) {
    this._data = {
      url: data.url || "",
      caption: data.caption || "",
      size: data.size || "",
    };

    this.api = api;
    this.block = block;

    this._wrapper = undefined;
  }

  static get toolbox() {
    return {
      title: "Link Image",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    };
  }

  render() {
    this._wrapper = makeElement<HTMLDivElement>("div", ["link-image"]);

    if (this._data.url) {
      this._showImage(this._data.url, this._data.caption, this._data.size);
      return this._wrapper;
    }

    this._showImageInput();

    return this._wrapper;
  }

  save(): LinkImageData {
    // Sanitize the caption to prevent XSS attacks
    // Only allow basic HTML tags like <b>, <i>, and <a> with href attribute
    const sanitizerConfig = {
      b: true,
      a: {
        href: true,
      },
      i: true,
    };

    this._data.caption = this.api.sanitizer.clean(
      this._data.caption,
      sanitizerConfig
    );

    return this._data;
  }

  validate(savedData: LinkImageData) {
    if (!savedData.url || savedData.url.trim() === "") {
      console.error("Image URL is required.");
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

    // create an image element
    this._data.url = url;
    const img = makeElement<HTMLImageElement>("img", [], {
      src: url,
    });

    const caption = makeElement<HTMLInputElement>("input", [], {
      id: "link-image__caption-input",
      type: "text",
      placeholder: "Caption for the image",
      value: captionText,
    });

    // Add event listener to update caption on input change but not on every keystroke update after a delay
    caption.addEventListener("input", () => {
      debounce(() => {
        this._data.caption = caption.value;
        this.block.dispatchChange();
      }, 500)();
    });

    const selectSizes = this._createSizeSelector();
    selectSizes.addEventListener("change", () => {
      this._data.size = selectSizes.value;
      this.block.dispatchChange();
    });
    selectSizes.value = size;

    // append the image and caption to the wrapper
    this._wrapper.innerHTML = ""; // clear previous content
    this._wrapper.appendChild(img);
    this._wrapper.appendChild(caption);
    this._wrapper.appendChild(selectSizes);
  }

  private _createSizeSelector() {
    const selectSizes = makeElement<HTMLSelectElement>("select", [], {
      id: "link-image__size-input",
    });

    // Default options for image sizes
    const defaultOption = makeElement<HTMLOptionElement>("option", [], {
      value: "",
      disabled: true,
    });
    defaultOption.textContent = "Select The Image Size";
    selectSizes.appendChild(defaultOption);

    this._imageSizes.forEach((sizes) => {
      const option = makeElement<HTMLOptionElement>("option", [], {
        value: sizes,
      });
      option.textContent = sizes;
      selectSizes.appendChild(option);
    });

    return selectSizes;
  }
}
