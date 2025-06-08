import * as consts from './consts.js';
import * as api    from './api.js';
import * as utils  from './utils.js';

import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

import Lenis      from 'https://cdn.jsdelivr.net/npm/lenis@1.3.15/+esm';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@17.0.1/+esm';

const app = Vue.createApp({
    setup() {
        const theme   = Vuetify.useTheme();
        const display = Vuetify.useDisplay();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const snackbar = Vue.reactive({
            modelValue: false,
            timeout:    3000,
            location:   'bottom',
            text:       '',
            color:      '',

            async show(text = '', color = '', timeout = this.timeout, location = this.location) {
                this.timeout  = timeout;
                this.location = location;
                this.text     = text;
                this.color    = color;

                this.modelValue = false;

                await Vue.nextTick();

                this.modelValue = true;
            }
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const developer = Vue.ref({});

        const repos_loading = Vue.ref(false);
        const repos         = Vue.ref([]);

        const REPOS_PER_PAGE = 10;

        const loadRepos = async () => {
            try {
                repos_loading.value = true;

                const currentPage = Math.floor(repos.value.length / REPOS_PER_PAGE) + 1;

                const result = await api.call(`${'https://api.github.com/users/kanaaa224'}/repos?per_page=${REPOS_PER_PAGE}&page=${currentPage}`);

                repos.value.push(...result);

                if(result.length >= REPOS_PER_PAGE) repos_loading.value = false;
            } catch(e) {
                console.error(e);

                snackbar.show('ページのロード中にエラーが発生しました', 'error');

                repos_loading.value = false;
            }
        };

        const renderer = {
            heading(token) {
                return `<div class="v-card-title text-h${token.depth + 3}">${token.text}</div>\n`;
            },

            paragraph(token) {
                token.text = token.text.replace(/\n/g, '<br>');

                token.text = token.text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
                    if(href.includes('.md')) return `<a href="#${href.replace(/\.md$/, '')}" class="text-primary font-weight-bold">${label}</a>`;

                    return `<a href="${href}" class="text-primary font-weight-bold" target="_blank">${label}</a>`;
                });

                return `<div class="v-card-text"><p>${token.text}</p></div>`;
            }
        };

        marked.use({ breaks: true, renderer });

        const mdFetch = async (id = '') => {
            try {
                const response = await fetch(`${id}.md?t=${Date.now()}`);
                const text     = await response.text();

                if(!response.ok) throw response.status;

                return marked.parse(text);
            } catch(e) {
                console.error(e);

                snackbar.show('ページデータのフェッチに失敗しました', 'error');
            }
        };

        const mdRender = async (id = '') => {
            document.querySelector(`#${id}`).innerHTML = await mdFetch(id);
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const dialog_article_view = Vue.reactive({
            modelValue: false,
            content:    '',

            async open(mdID = '') {
                if(!this.modelValue) this.content = await mdFetch(mdID);

                this.modelValue = true;
            },

            close() {
                this.modelValue = false;
            }
        });

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const container_visible  = Vue.ref(false);
        const top_button_visible = Vue.ref(false);

        const contents = [ 'profile', 'skills', 'works' ];

        const onScroll = () => {
            top_button_visible.value = window.scrollY >= 50;
        };

        const onHashchange = () => {
            const hash = window.location.hash.slice(1);

            contents.includes(hash) ? dialog_article_view.close() : dialog_article_view.open(hash);
        };

        Vue.onMounted(async () => {
            document.title = consts.app.name;

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                theme.global.name.value = e.matches ? 'dark' : 'light';
            });

            const lenis = new Lenis({ autoRaf: true, duration: 1.5 });

            try {
                developer.value = await api.call('https://api.github.com/users/kanaaa224');
            } catch(e) {
                console.error(e);
            }

            await loadRepos();

            container_visible.value = true;

            await Vue.nextTick();

            window.addEventListener('scroll',     onScroll);
            window.addEventListener('hashchange', onHashchange);

            for(const content of contents) await mdRender(content);

            contents.push(...[ '', 'top', 'repositories' ]);

            setTimeout(onHashchange, 500);
        });

        return {
            consts,
            api,

            theme,
            display,

            snackbar,

            developer,
            repos_loading,
            repos,
            loadRepos,

            dialog_article_view,

            container_visible,
            top_button_visible
        }
    },
    template: `
        <v-app style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
            <v-snackbar v-bind="snackbar" />
            <v-dialog
                v-bind="dialog_article_view"
                fullscreen
                data-lenis-prevent
            >
                <v-card style="padding-top: env(safe-area-inset-top);">
                    <v-toolbar class="position-fixed" color="transparent">
                        <v-btn
                            icon="mdi-close"
                            class="ms-auto"
                            href="#works"
                            @click="dialog_article_view.close()"
                        />
                    </v-toolbar>
                    <v-card-text v-html="dialog_article_view.content" />
                </v-card>
            </v-dialog>
            <v-main>
                <v-fade-transition mode="out-in">
                    <v-container v-if="container_visible">
                        <div class="d-flex align-center justify-space-between" :class="display.xs.value ? 'py-2 mb-3' : 'py-4 mb-5'" style="position: sticky; top: 0; z-index: 10; backdrop-filter: blur(2rem);">
                            <p class="pl-4">kanaaa224</p>
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
                                        <v-img :src="developer.avatar_url" alt="Avatar">
                                    </v-avatar>
                                    <div>
                                        <div class="text-h6">{{ developer.name || developer.login }}</div>
                                        <div class="text-subtitle-2 text-grey">@{{ developer.login }}</div>
                                    </div>
                                </div>
                                <div class="d-flex justify-center justify-md-end flex-wrap">
                                    <v-btn
                                        icon variant="plain"
                                        target="_blank"
                                        rel="noopener"
                                        href="//kanaaa224.github.io"
                                    ><v-icon icon="mdi-home" /></v-btn>
                                    <v-btn
                                        icon variant="plain"
                                        target="_blank"
                                        rel="noopener"
                                        href="//github.com/kanaaa224"
                                    ><v-icon icon="mdi-github" /></v-btn>
                                </div>
                            </div>
                        </v-card>
                        <v-card class="card-shadow pa-2" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="profile">
                            <div class="text-center my-5">
                                <v-progress-circular indeterminate size="28" />
                            </div>
                        </v-card>
                        <v-card class="card-shadow pa-2" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="skills">
                            <div class="text-center my-5">
                                <v-progress-circular indeterminate size="28" />
                            </div>
                        </v-card>
                        <v-card class="card-shadow pa-2" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="works">
                            <div class="text-center my-5">
                                <v-progress-circular indeterminate size="28" />
                            </div>
                        </v-card>
                        <v-card class="card-shadow pa-2" :class="display.xs.value ? 'mt-5' : 'mt-10'" elevation="0" rounded="lg" id="repositories">
                            <v-card-title class="text-h5">リポジトリ</v-card-title>
                            <v-list>
                                <v-list-item
                                    v-for="(repo, index) in repos"
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
                                                rel="noopener noreferrer"
                                            ><v-icon icon="mdi-web" /></v-btn>
                                            <v-btn
                                                icon
                                                variant="plain"
                                                :href="repo.html_url"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            ><v-icon icon="mdi-github" /></v-btn>
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-list>
                            <v-card-text>
                                <v-btn
                                    variant="plain"
                                    :size="display.xs.value ? 'small' : 'default'"
                                    :disabled="repos_loading"
                                    @click="loadRepos()"
                                ><v-icon class="mr-1" icon="mdi-download" />さらに読み込む</v-btn>
                                <v-btn
                                    variant="plain"
                                    :size="display.xs.value ? 'small' : 'default'"
                                    href="//github.com/kanaaa224?tab=repositories"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                ><v-icon class="mr-1" icon="mdi-github" />GitHubで確認</v-btn>
                            </v-card-text>
                        </v-card>
                    </v-container>
                </v-fade-transition>
                <v-fade-transition mode="out-in">
                    <v-btn
                        v-if="top_button_visible"
                        style="position: fixed; bottom: 2rem; right: 2rem; z-index: 999;"
                        icon
                        variant="plain"
                        :size="display.xs.value ? 'small' : 'default'"
                        href="#top"
                    ><v-icon icon="mdi-arrow-up" /></v-btn>
                </v-fade-transition>
            </v-main>
            <v-footer class="justify-center pb-2" style="margin-bottom: env(safe-area-inset-bottom); opacity: 0.25; background-color: transparent;" v-if="container_visible">
                <span class="text-body-2">
                    © 2025 <a
                        style="color: inherit;"
                        href="https://kanaaa224.github.io/"
                        target="_blank"
                        rel="noopener"
                    >kanaaa224</a>. All rights reserved.
                </span>
            </v-footer>
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