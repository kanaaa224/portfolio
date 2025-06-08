import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

import * as app_methods from './app-methods.js';

const state = Vue.reactive({
    modelValue: false,

    content: '',

    loading: false
});

const component = {
    setup() {
        const display = Vuetify.useDisplay();

        return {
            state,
            methods,

            display
        }
    },
    template: `
        <v-dialog
            v-bind="state"
            :class="display.xs.value ? 'ma-4' : 'ma-16'"
            fullscreen
            data-lenis-prevent
            @update:modelValue="(v) => methods.update(v)"
        >
            <v-card :loading="state.loading" :disabled="state.loading">
                <v-toolbar class="position-fixed" color="transparent">
                    <v-toolbar-title></v-toolbar-title>
                    <v-toolbar-items>
                        <v-btn
                            icon="mdi-close"
                            href="#works"
                            @click="methods.close()"
                        />
                    </v-toolbar-items>
                </v-toolbar>
                <v-fade-transition mode="out-in">
                    <v-card-text v-html="state.content" v-if="!state.loading" />
                    <!-- <v-skeleton-loader type="image, article, text" v-else></v-skeleton-loader> -->
                </v-fade-transition>
            </v-card>
        </v-dialog>
    `
};

const methods = {
    close() {
        state.modelValue = false;
    },

    async open(contentID = '') {
        this.close();

        await Vue.nextTick();

        state.modelValue = true;

        if(state.loading) return;

        state.loading = true;

        state.content = '';
        state.content = await app_methods.md_fetch(contentID);

        state.loading = false;
    },

    update(value = false) {
        if(value) return;

        const hash = 'works';

        if(window.location.hash === `#${hash}`) return;

        window.location.hash = `#${hash}`;

        this.close();

        Vue.nextTick(() => {
            const e = document.querySelector(`#${hash}`);

            if(e) e.scrollIntoView({ behavior: 'smooth' });
        });
    }
};

export default { state, component, ...methods }
export function use() { return { state, ...methods } }