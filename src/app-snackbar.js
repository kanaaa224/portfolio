import * as Vue from 'vue';

const state = Vue.reactive({
    modelValue: false,

    text: '', color: '',

    timeout: 3000, location: 'bottom'
});

const methods = {
    hide() {
        state.modelValue = false;
    },

    async show(text = '', color = '', timeout = state.timeout, location = state.location) {
        state.text  = text;
        state.color = color;

        state.timeout  = timeout;
        state.location = location;

        this.hide();

        await Vue.nextTick();

        state.modelValue = true;
    }
};

const component = {
    setup() {
        return {
            state, methods
        }
    },
    template: `
        <v-snackbar v-bind="state" />
    `
};

export default { state, ...methods, component }
export function use() { return { state, ...methods } }