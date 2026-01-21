import { system } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData, } from "@minecraft/server-ui";
export async function ForceShow(form, player, timeout = 10) {
    const end = system.currentTick + (timeout === -1 ? 9999 * 20 : timeout * 20);
    while (system.currentTick <= end) {
        const response = await form.show(player);
        if (response.cancelationReason !== "UserBusy") {
            return response;
        }
    }
    throw new Error(`Timed out after ${timeout} ticks`);
}
export class ActionForm {
    form = new ActionFormData();
    constructor() {
        return this;
    }
    body(text) {
        this.form.body(text);
        return this;
    }
    title(text) {
        this.form.title(text);
        return this;
    }
    devider() {
        this.form.divider();
        return this;
    }
    header(text) {
        this.form.header(text);
        return this;
    }
    label(text) {
        this.form.label(text);
        return this;
    }
    button(text, icon) {
        this.form.button(text, icon);
        return this;
    }
    async show(player, timeout = 10) {
        const hasil = await ForceShow(this.form, player, timeout);
        return hasil;
    }
}
export class MessageForm {
    form = new MessageFormData();
    constructor() {
        return this;
    }
    body(text) {
        this.form.body(text);
        return this;
    }
    title(text) {
        this.form.title(text);
        return this;
    }
    button1(text) {
        this.form.button1(text);
        return this;
    }
    button2(text) {
        this.form.button2(text);
        return this;
    }
    async show(player, timeout = 10) {
        const hasil = await ForceShow(this.form, player, timeout);
        return hasil;
    }
}
export class ModalForm {
    form = new ModalFormData();
    constructor() {
        return this;
    }
    title(text) {
        this.form.title(text);
        return this;
    }
    header(text) {
        this.form.header(text);
        return this;
    }
    label(text) {
        this.form.label(text);
        return this;
    }
    devider() {
        this.form.divider();
        return this;
    }
    slider(label, minValue, maxValue, sliderOptions) {
        this.form.slider(label, minValue, maxValue, sliderOptions);
        return this;
    }
    toggle(label, toggleOptions) {
        this.form.toggle(label, toggleOptions);
        return this;
    }
    dropdown(label, items, dropdownOptions) {
        this.form.dropdown(label, items, dropdownOptions);
        return this;
    }
    textField(label, placeholderText, textFieldOptions) {
        this.form.textField(label, placeholderText, textFieldOptions);
        return this;
    }
    async show(player, timeout = 10) {
        const hasil = await ForceShow(this.form, player, timeout);
        return hasil;
    }
}
