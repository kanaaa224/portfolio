import * as Vue from 'vue';

const state = Vue.reactive({});

const component = {
    setup() {
        return {}
    },
    template: `
        <v-footer class="justify-center pa-2" style="margin-bottom: env(safe-area-inset-bottom); opacity: 0.25; background-color: transparent;" app>
            <span class="text-body-2">
                © 2025 <a
                    style="color: inherit;"
                    href="https://kanaaa224.github.io/"
                    target="_blank"
                    rel="noopener"
                >kanaaa224</a>. All rights reserved.
            </span>
        </v-footer>
    `
};

const methods = {};

export default { state, component, ...methods }
export function use() { return { state, ...methods } }