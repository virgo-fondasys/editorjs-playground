import type { API, BlockToolConstructorOptions } from "@editorjs/editorjs";
import { makeElement } from "../helper/helper";

interface CallToActionData {
  type: string;
}
export default class CallToActionAlert {
  private _data: CallToActionData;

  private api: API;

  constructor({ data, api }: BlockToolConstructorOptions<CallToActionData>) {
    this._data = {
      type: data.type || "",
    };

    this.api = api;
  }

  static get toolbox() {
    return {
      title: "Call to Action Alert",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-warning-icon lucide-message-circle-warning"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    };
  }

  render() {
    const wrapper = makeElement<HTMLDivElement>("div", [
      "call-to-action-alert",
      this.api.styles.block,
    ]);

    const label = makeElement<HTMLLabelElement>("label", ["cta-label"]);
    label.textContent = "Select Call to Action Type: ";

    const select = this._createSelect();

    wrapper.appendChild(label);
    wrapper.appendChild(select);

    return wrapper;
  }

  save() {
    return this._data;
  }

  private _createSelect() {
    const select = makeElement<HTMLSelectElement>("select", [
      "cta-select",
      this.api.styles.input,
    ]);

    const options = ["Access"];

    options.forEach((optionText) => {
      const option = makeElement<HTMLOptionElement>("option");

      option.value = optionText.toLowerCase().replace(" ", "-");
      option.textContent = optionText;
      if (this._data.type === optionText) {
        option.selected = true;
      }

      select.appendChild(option);
    });

    select.value = this._data.type;

    select.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      this._data.type = target.value;
    });

    return select;
  }
}
