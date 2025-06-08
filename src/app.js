import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

import snackbar            from './app-snackbar.js';
import dialog_settings     from './app-dialog-settings.js';
import dialog_article_view from './app-dialog-article-view.js';
import main                from './app-main.js';
import footer              from './app-footer.js';

const app = Vue.createApp({
    components: {
        'app-snackbar':            snackbar           .component,
        'app-dialog-settings':     dialog_settings    .component,
        'app-dialog-article-view': dialog_article_view.component,
        'app-main':                main               .component,
        'app-footer':              footer             .component
    },
    setup() {
        return {}
    },
    template: `
        <v-app style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
            <app-snackbar />
            <app-dialog-settings />
            <app-dialog-article-view />
            <app-main />
            <app-footer />
        </v-app>
    `
});

const vuetify = Vuetify.createVuetify({
    theme: {
        defaultTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    background: '#fff',
                    surface:    '#fff',
                    primary:    '#2196f3',
                    secondary:  '#444',
                    error:      '#c23131'
                }
            },
            dark: {
                dark: true,
                colors: {
                    background: '#222',
                    surface:    '#292929',
                    primary:    '#2196f3',
                    secondary:  '#eee',
                    error:      '#c23131'
                }
            }
        }
    }
});

app.use(vuetify);

export default app;