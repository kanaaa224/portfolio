import * as Vue from 'vue';

const state = Vue.reactive({
    modelValue: false,

    timeout:  3000,
    location: 'bottom',

    text:  '',
    color: ''
});

const component = {
    setup() {
        return {
            state
        }
    },
    template: `
        <v-snackbar v-bind="state" />
    `
};

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

export default { state, component, ...methods }
export function use() { return { state, ...methods } }