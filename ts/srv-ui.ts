import { Player, RawMessage, system } from "@minecraft/server";
import {
  ActionFormData,
  ActionFormResponse,
  FormCancelationReason,
  MessageFormData,
  MessageFormResponse,
  ModalFormData,
  ModalFormDataDropdownOptions,
  ModalFormDataSliderOptions,
  ModalFormDataTextFieldOptions,
  ModalFormDataToggleOptions,
  ModalFormResponse,
} from "@minecraft/server-ui";

export async function ForceShow<
  T extends ActionFormData | ModalFormData | MessageFormData,
>(
  form: T,
  player: any,
  timeout: number = 10,
): Promise<
  T extends ActionFormData
    ? ActionFormResponse
    : T extends ModalFormData
      ? ModalFormResponse
      : T extends MessageFormData
        ? MessageFormResponse
        : never
> {
  const end = system.currentTick + (timeout === -1 ? 9999 * 20 : timeout * 20);
  while (system.currentTick <= end) {
    const response = await form.show(player);
    if (response.cancelationReason !== "UserBusy") {
      return response as any;
    }
  }
  throw new Error(`Timed out after ${timeout} ticks`);
}

export class ActionForm {
  private form: ActionFormData = new ActionFormData();
  constructor() {
    return this;
  }

  body(text: RawMessage | string): this {
    this.form.body(text);
    return this;
  }

  title(text: RawMessage | string): this {
    this.form.title(text);
    return this;
  }

  devider(): this {
    this.form.divider();
    return this;
  }

  header(text: RawMessage | string): this {
    this.form.header(text);
    return this;
  }

  label(text: RawMessage | string): this {
    this.form.label(text);
    return this;
  }

  button(text: RawMessage | string, icon?: string): this {
    this.form.button(text, icon);
    return this;
  }

  async show(
    player: Player,
    timeout: number = 10,
  ): Promise<ActionFormResponse> {
    const hasil = await ForceShow(this.form, player, timeout);
    return hasil;
  }
}

export class MessageForm {
  private form: MessageFormData = new MessageFormData();
  constructor() {
    return this;
  }

  body(text: RawMessage | string): this {
    this.form.body(text);
    return this;
  }

  title(text: RawMessage | string): this {
    this.form.title(text);
    return this;
  }

  button1(text: RawMessage | string): this {
    this.form.button1(text);
    return this;
  }

  button2(text: RawMessage | string): this {
    this.form.button2(text);
    return this;
  }

  async show(
    player: Player,
    timeout: number = 10,
  ): Promise<MessageFormResponse> {
    const hasil = await ForceShow(this.form, player, timeout);
    return hasil;
  }
}

export class ModalForm<T extends unknown[] = []> {
  private form: ModalFormData = new ModalFormData();
  constructor() {
    return this;
  }

  title(text: RawMessage | string): this {
    this.form.title(text);
    return this;
  }

  header(text: RawMessage | string): ModalForm<[...T, undefined]> {
    this.form.header(text);
    return this as unknown as ModalForm<[...T, undefined]>;
  }

  label(text: RawMessage | string): ModalForm<[...T, undefined]> {
    this.form.label(text);
    return this as unknown as ModalForm<[...T, undefined]>;
  }

  devider(): ModalForm<[...T, undefined]> {
    this.form.divider();
    return this as unknown as ModalForm<[...T, undefined]>;
  }

  slider(
    label: RawMessage | string,
    minValue: number,
    maxValue: number,
    sliderOptions?: ModalFormDataSliderOptions,
  ): ModalForm<[...T, number]> {
    this.form.slider(label, minValue, maxValue, sliderOptions);
    return this as unknown as ModalForm<[...T, number]>;
  }

  toggle(
    label: RawMessage | string,
    toggleOptions?: ModalFormDataToggleOptions,
  ): ModalForm<[...T, boolean]> {
    this.form.toggle(label, toggleOptions);
    return this as unknown as ModalForm<[...T, boolean]>;
  }

  dropdown(
    label: RawMessage | string,
    items: (RawMessage | string)[],
    dropdownOptions?: ModalFormDataDropdownOptions,
  ): ModalForm<[...T, number]> {
    this.form.dropdown(label, items, dropdownOptions);
    return this as unknown as ModalForm<[...T, number]>;
  }

  textField(
    label: RawMessage | string,
    placeholderText: RawMessage | string,
    textFieldOptions?: ModalFormDataTextFieldOptions,
  ): ModalForm<[...T, string]> {
    this.form.textField(label, placeholderText, textFieldOptions);
    return this as unknown as ModalForm<[...T, string]>;
  }

  async show(
    player: Player,
    timeout: number = 10,
  ): Promise<{
    canceled: boolean;
    formValues: T;
    cancelationReason: FormCancelationReason | unknown;
  }> {
    const hasil = await ForceShow(this.form, player, timeout);
    return hasil as {
      canceled: boolean;
      formValues: T;
      cancelationReason: FormCancelationReason | unknown;
    };
  }
}
