import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

import * as consts from './consts.js';
import * as api    from './api.js';

import snackbar            from './app-snackbar.js';
import dialog_settings     from './app-dialog-settings.js';
import dialog_article_view from './app-dialog-article-view.js';
import * as app_methods    from './app-methods.js';

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.15/+esm';

const state = Vue.reactive({
    visible: false,

    top_button_visible: false,

    repos: [],
    repos_load_disabled: false,

    contents: {},

    loading: false
});

const component = {
    setup() {
        const theme   = Vuetify.useTheme();
        const display = Vuetify.useDisplay();

        Vue.onMounted(async () => {
            document.title = consts.app.name;

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                theme.global.name.value = e.matches ? 'dark' : 'light';
            });

            /* try {
                await api.main.connect();
            } catch(e) {
                console.error(e);
            } */

            const lenis = new Lenis({ autoRaf: true, duration: 1.5 });

            state.visible = true;

            await Vue.nextTick();

            window.addEventListener('scroll', () => {
                state.top_button_visible = window.scrollY >= 50;
            });

            await methods.repos_load();

            const hashes = [ 'profile', 'skills', 'works' ];

            const onHashchange = async () => {
                const hash = window.location.hash.slice(1);

                hashes.includes(hash) ? dialog_article_view.close() : await dialog_article_view.open(hash);
            };

            window.addEventListener('hashchange', onHashchange);

            for(const hash of hashes) state.contents[hash] = await app_methods.md_fetch(hash);

            await Vue.nextTick();

            hashes.push('repositories');

            const hash = window.location.hash.slice(1);

            if(hashes.includes(hash)) {
                const e = document.querySelector(`#${hash}`);

                if(e) setTimeout(() => { e.scrollIntoView({ behavior: 'smooth' }); }, 1500);
            }

            hashes.push(...[ '', 'top' ]);

            setTimeout(onHashchange, 500);
        });

        return {
            state,
            methods,

            theme,
            display,

            dialog_settings
        }
    },
    template: `
        <v-main>
            <v-fade-transition mode="out-in">
                <v-container v-if="state.visible">
                    <div class="d-flex align-center justify-space-between" :class="display.xs.value ? 'py-2 mb-3' : 'py-4 mb-5'" style="position: sticky; top: 0; z-index: 10; backdrop-filter: blur(2rem);">
                        <p class="pl-4" @click="dialog_settings.open()">kanaaa224</p>
                        <div class="d-flex">
                            <div v-if="!display.xs.value">
                                <v-btn variant="plain" href="#profile">Profile</v-btn>
                                <v-btn variant="plain" href="#skills">Skills</v-btn>
                                <v-btn variant="plain" href="#works">Works</v-btn>
                                <v-btn variant="plain" href="#repositories">Repositories</v-btn>
                            </div>
                            <v-btn
                                variant="plain"
                                @click="theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'"
                            ><v-icon :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" /></v-btn>
                        </div>
                    </div>
                    <v-card class="pa-6" elevation="0" rounded="lg">
                        <div class="d-flex flex-column flex-md-row align-md-center justify-md-space-between">
                            <div class="d-flex align-center">
                                <v-avatar size="64" class="me-4">
                                    <v-img src="https://github.com/kanaaa224.png" alt="Avatar">
                                </v-avatar>
                                <div>
                                    <div class="text-h6">Kanato Shimabukuro</div>
                                    <div class="text-subtitle-2 text-grey">@kanaaa224</div>
                                </div>
                            </div>
                            <div class="d-flex justify-center justify-md-end flex-wrap">
                                <v-btn
                                    icon variant="plain"
                                    target="_blank"
                                    rel="noopener"
                                    href="https://kanaaa224.github.io"
                                ><v-icon icon="mdi-home" /></v-btn>
                                <v-btn
                                    icon variant="plain"
                                    target="_blank"
                                    rel="noopener"
                                    href="https://github.com/kanaaa224"
                                ><v-icon icon="mdi-github" /></v-btn>
                            </div>
                        </div>
                    </v-card>
                    <v-card class="card-shadow" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="profile">
                        <v-fade-transition mode="out-in">
                            <v-card-text v-html="state.contents.profile" v-if="state.contents.profile" />
                            <v-skeleton-loader class="ma-2" type="article, text" v-else></v-skeleton-loader>
                        </v-fade-transition>
                    </v-card>
                    <v-card class="card-shadow" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="skills">
                        <v-fade-transition mode="out-in">
                            <v-card-text v-html="state.contents.skills" v-if="state.contents.skills" />
                            <v-skeleton-loader class="ma-2" type="article, text" v-else></v-skeleton-loader>
                        </v-fade-transition>
                    </v-card>
                    <v-card class="card-shadow" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="works">
                        <v-fade-transition mode="out-in">
                            <v-card-text v-html="state.contents.works" v-if="state.contents.works" />
                            <v-skeleton-loader class="ma-2" type="article, text" v-else></v-skeleton-loader>
                        </v-fade-transition>
                    </v-card>
                    <v-card class="card-shadow pa-2" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="repositories" :loading="state.loading" :disabled="state.loading">
                        <v-card-title class="text-h5">リポジトリ</v-card-title>
                        <v-list>
                            <v-list-item
                                v-for="(repo, index) in state.repos"
                                :key="repo.id"
                                class="py-2"
                                :class="[
                                    index % 2 === 1 ? (theme.global.current.value.dark ? 'bg-grey-darken-4' : 'bg-grey-lighten-4') : '',
                                    display.xs.value ? 'mx-1' : 'mx-4'
                                ]"
                                rounded="lg"
                            >
                                <div class="d-flex align-center justify-space-between" :class="display.xs.value ? 'pl-3' : 'pl-4'">
                                    <div class="text-truncate">
                                        <v-list-item-title>{{ repo.name }}</v-list-item-title>
                                        <v-list-item-subtitle v-if="repo.description">{{ repo.description }}</v-list-item-subtitle>
                                        <v-list-item-subtitle class="grey--text text--darken-1 text-caption">
                                            スター: {{ repo.stargazers_count }} | フォーク: {{ repo.forks_count }}
                                            <span v-if="repo.language"> | 使用言語: {{ repo.language }}</span>
                                        </v-list-item-subtitle>
                                    </div>
                                    <div class="d-flex">
                                        <v-btn
                                            :class="display.xs.value ? '' : 'mr-2'"
                                            v-if="repo.has_pages"
                                            icon
                                            variant="plain"
                                            :href="repo.homepage"
                                            target="_blank"
                                            rel="noopener"
                                        ><v-icon icon="mdi-web" /></v-btn>
                                        <v-btn
                                            icon
                                            variant="plain"
                                            :href="repo.html_url"
                                            target="_blank"
                                            rel="noopener"
                                        ><v-icon icon="mdi-github" /></v-btn>
                                    </div>
                                </div>
                            </v-list-item>
                        </v-list>
                        <v-card-text>
                            <v-btn
                                variant="plain"
                                :size="display.xs.value ? 'small' : 'default'"
                                :disabled="state.repos_load_disabled"
                                @click="methods.repos_load()"
                            ><v-icon class="mr-1" icon="mdi-download" />さらに読み込む</v-btn>
                            <v-btn
                                variant="plain"
                                :size="display.xs.value ? 'small' : 'default'"
                                href="https://github.com/kanaaa224?tab=repositories"
                                target="_blank"
                                rel="noopener"
                            ><v-icon class="mr-1" icon="mdi-github" />GitHubで確認</v-btn>
                        </v-card-text>
                    </v-card>
                </v-container>
            </v-fade-transition>
            <v-fade-transition mode="out-in">
                <v-btn
                    v-if="state.top_button_visible"
                    style="position: fixed; bottom: 2rem; right: 2rem; z-index: 999;"
                    icon
                    variant="plain"
                    :size="display.xs.value ? 'small' : 'default'"
                    href="#top"
                ><v-icon icon="mdi-arrow-up" /></v-btn>
            </v-fade-transition>
        </v-main>
    `
};

const methods = {
    async repos_load() {
        state.loading = true;

        const REPOS_PER_PAGE = 10;

        try {
            const currentPage = Math.floor(state.repos.length / REPOS_PER_PAGE) + 1;

            const result = await api.call(`https://api.github.com/users/${'kanaaa224'}/repos?per_page=${REPOS_PER_PAGE}&page=${currentPage}`);

            state.repos.push(...result);

            if(result.length < REPOS_PER_PAGE) state.repos_load_disabled = true;
        } catch(e) {
            console.error(e);

            await snackbar.show('ページのロード中にエラーが発生しました', 'error');
        }

        state.loading = false;
    }
};

export default { state, component, ...methods }
export function use() { return { state, ...methods } }