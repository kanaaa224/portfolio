import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

import * as consts from './consts.js';
//import * as api    from './api.js';

const state = Vue.reactive({
    modelValue: false,

    //api_version: null
});

const component = {
    setup() {
        const display = Vuetify.useDisplay();

        return {
            state,
            methods,

            display,

            consts,
            //api
        }
    },
    template: `
        <v-dialog
            v-bind="state"
            transition="dialog-bottom-transition"
            :max-width="display.xs.value ? undefined : '75%'"
        >
            <v-card>
                <v-toolbar>
                    <v-toolbar-title>システム設定</v-toolbar-title>
                    <v-toolbar-items>
                        <v-btn
                            icon="mdi-close"
                            @click="methods.close()"
                        />
                    </v-toolbar-items>
                </v-toolbar>
                <v-list lines="two">
                    <!-- <v-list-subheader title="システムAPI" />
                    <v-list-item
                        title="アタッチされているAPI"
                        :subtitle="api.main.name"
                        href="https://github.com/kanaaa224/home-server-web-api"
                        target="_blank"
                        rel="noopener"
                    ><template #append><v-icon icon="mdi-chevron-right" /></template></v-list-item>
                    <v-list-item
                        title="バージョン"
                        :subtitle="state.api_version || '取得しています...'"
                    />
                    <v-list-item
                        title="エンドポイント"
                        :subtitle="api.main.url"
                    />
                    <v-divider /> -->
                    <v-list-subheader title="アプリケーション" />
                    <v-list-item
                        title="バージョン"
                        :subtitle="consts.app.version"
                    />
                    <v-divider />
                    <v-list-item
                        class="text-center"
                        subtitle="© 2025 kanaaa224. All rights reserved."
                        href="https://kanaaa224.github.io/"
                        target="_blank"
                        rel="noopener"
                    />
                </v-list>
            </v-card>
        </v-dialog>
    `
};

const methods = {
    close() {
        state.modelValue = false;
    },

    async open() {
        this.close();

        await Vue.nextTick();

        state.modelValue = true;

        /* if(state.api_version) return;

        try {
            state.api_version = await api.main.call({ method: 'version' });
        } catch(e) {
            console.error(e);
        } */
    }
};

export default { state, component, ...methods }
export function use() { return { state, ...methods } }