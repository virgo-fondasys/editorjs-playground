import type { BlockToolConstructorOptions } from "@editorjs/editorjs";
import { makeElement } from "../helper/helper";

interface ShoppingCardData {
  title: string;
  imageUrl: string;
  imageAltText: string;
  description: string;
  price: string;
  buyButtonText: string;
  buyLink: string;
  secondPrice?: string;
  secondBuyButtonText?: string;
  secondBuyLink?: string;
}

export default class ShoppingCard {
  private data: ShoppingCardData;
  private wrapper: HTMLDivElement | null = null;

  constructor({ data }: BlockToolConstructorOptions<ShoppingCardData>) {
    this.data = {
      title: data.title || "",
      imageUrl: data.imageUrl || "",
      imageAltText: data.imageAltText || "",
      description: data.description || "",
      price: data.price || "",
      buyButtonText: data.buyButtonText || "",
      buyLink: data.buyLink || "",
      secondPrice: data.secondPrice || "",
      secondBuyButtonText: data.secondBuyButtonText || "",
      secondBuyLink: data.secondBuyLink || "",
    };
  }

  static get toolbox() {
    return {
      title: "Shopping Card",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-basket-icon lucide-shopping-basket"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/><path d="m9 11 1 9"/></svg>`,
    };
  }
  render() {
    this.wrapper = makeElement<HTMLDivElement>("div", ["shopping-card"]);

    const wrapperLabel = makeElement<HTMLLabelElement>("label", [
      "shopping-card__card-label",
    ]);

    wrapperLabel.textContent = "Shopping Card";
    this.wrapper.appendChild(wrapperLabel);

    const inputs = [
      { label: "Title", tag: "input", type: "text", name: "title" },
      { label: "Image URL", tag: "input", type: "text", name: "imageUrl" },
      {
        label: "Image Alt Text",
        tag: "input",
        type: "text",
        name: "imageAltText",
      },
      {
        label: "Description",
        tag: "textarea",
        type: "text",
        name: "description",
      },
      { label: "Price", tag: "input", type: "text", name: "price" },
      {
        label: "Buy Button Text",
        tag: "input",
        type: "text",
        name: "buyButtonText",
      },
      { label: "Buy Link", tag: "input", type: "text", name: "buyLink" },
      {
        label: "2nd Price (optional)",
        tag: "input",
        type: "text",
        name: "secondPrice",
      },
      {
        label: "2nd Buy Button Text (optional)",
        tag: "input",
        type: "text",
        name: "secondBuyButtonText",
      },
      {
        label: "2nd Buy Link (optional)",
        tag: "input",
        type: "text",
        name: "secondBuyLink",
      },
    ];

    inputs.forEach((input) => {
      const inputWrapper = makeElement<HTMLDivElement>("div", [
        "shopping-card__input-wrapper",
      ]);

      const label = makeElement<HTMLLabelElement>("label", [
        "shopping-card__input-label",
      ]);
      label.textContent = input.label;
      inputWrapper.appendChild(label);

      if (input.tag === "input") {
        const inputField = makeElement<HTMLInputElement>(
          "input",
          ["shopping-card__input"],
          {
            type: input.type,
            name: input.name,
            placeholder: `Enter ${input.label.toLowerCase()}`,
          }
        );

        inputField.value =
          this.data[input.name as keyof ShoppingCardData] || "";

        inputWrapper.appendChild(inputField);
      }

      if (input.tag === "textarea") {
        const inputField = makeElement<HTMLTextAreaElement>(
          "textarea",
          ["shopping-card__textarea", "shopping-card__input"],
          {
            name: input.name,
            placeholder: `Enter ${input.label.toLowerCase()}`,
          }
        );
        inputField.value =
          this.data[input.name as keyof ShoppingCardData] || "";
        inputWrapper.appendChild(inputField);
      }

      this.wrapper!.appendChild(inputWrapper);
    });

    return this.wrapper;
  }

  save() {
    if (!this.wrapper) return this.data;

    const inputs = Array.from(
      this.wrapper.querySelectorAll(".shopping-card__input")
    ) as HTMLInputElement[];
    const textareas = Array.from(
      this.wrapper.querySelectorAll(".shopping-card__textarea")
    ) as HTMLTextAreaElement[];

    inputs.forEach((input) => {
      this.data[input.name as keyof ShoppingCardData] = input.value;
    });

    textareas.forEach((textarea) => {
      this.data[textarea.name as keyof ShoppingCardData] = textarea.value;
    });

    return this.data;
  }

  // Clean up event listeners when block is destroyed
  destroy() {}
}
