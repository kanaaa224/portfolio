import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

import * as consts from './consts.js';

const state = Vue.reactive({
    modelValue: false
});

const methods = {
    close() {
        state.modelValue = false;
    },

    async open() {
        this.close();

        await Vue.nextTick();

        state.modelValue = true;
    }
};

const component = {
    setup() {
        const display = Vuetify.useDisplay();

        return {
            state, methods,

            display,

            consts
        }
    },
    template: `
        <v-dialog v-bind="state" transition="dialog-bottom-transition" :max-width="display.xs.value ? undefined : '75%'">
            <v-card>
                <v-toolbar>
                    <v-toolbar-title text="システム設定" />
                    <v-toolbar-items>
                        <v-btn icon="mdi-close" @click="methods.close()" />
                    </v-toolbar-items>
                </v-toolbar>
                <v-list lines="two">
                    <v-list-subheader title="アプリケーション" />
                    <v-list-item title="バージョン" :subtitle="consts.app.version" />
                    <v-divider />
                    <v-list-item class="text-center" subtitle="© 2025 kanaaa224. All rights reserved." href="https://kanaaa224.github.io" target="_blank" rel="noopener" />
                </v-list>
            </v-card>
        </v-dialog>
    `
};

export default { state, ...methods, component }
export function use() { return { state, ...methods } }