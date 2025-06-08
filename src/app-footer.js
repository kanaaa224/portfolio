import * as Vue from 'vue';

const state = Vue.reactive({});

const methods = {};

const component = {
    setup() {
        return {
            state, methods
        }
    },
    template: `
        <v-footer app class="d-flex justify-center align-center bg-transparent text-caption">
            <span style="opacity: .25;">© 2025 <a style="color: inherit;" href="https://kanaaa224.github.io" target="_blank" rel="noopener">kanaaa224</a>. All rights reserved.</span>
        </v-footer>
    `
};

export default { state, ...methods, component }
export function use() { return { state, ...methods } }