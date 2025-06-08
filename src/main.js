const { createApp, ref, onMounted, nextTick } = Vue;
const { createVuetify, useTheme } = Vuetify;

const vuetify = createVuetify({
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

const app = createApp({
    setup() {
        const logging = (d = '') => {
            console.log(`[ ${(new Date()).toISOString()} ] ${d}`);
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const callAPI = async (uri = '', queries = '', requestBody = null, endpoint = API_ENDPOINTS[0]) => {
            uri = `${endpoint}${uri}`;

            if(queries) uri += /\?/.test(uri) ? `&${queries}` : `?${queries}`;

            let request = { method: 'GET' };

            if(requestBody) request = { method: 'POST', body: JSON.stringify(requestBody) };

            const response = await fetch(uri, request);
            const data     = await response.json();

            if(!response.ok) throw new Error(`api-bad-status: ${response.status}`);

            return data;
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const snackbar_visible = ref(false);
        const snackbar_message = ref('');
        const snackbar_color   = ref('');
        const snackbar_time    = ref(5000);

        const snackbar = (message = null, color = null, time = null) => {
            if(!snackbar_visible.value) {
                snackbar_message.value = message ?? snackbar_message.value;
                snackbar_color.value   = color   ?? snackbar_color.value;
                snackbar_time.value    = time    ?? snackbar_time.value;
                snackbar_visible.value = true;
            }
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const dialog_loading_visible = ref(false);
        const dialog_loading_title   = ref('');
        const dialog_loading_icon    = ref('');

        const dialog_loading = (title = null, icon = null) => {
            if(!dialog_loading_visible.value) {
                dialog_loading_title.value   = title ?? dialog_loading_title.value;
                dialog_loading_icon.value    = icon  ?? dialog_loading_icon.value;
                dialog_loading_visible.value = true;
            }
        };

        const dialog_settings_visible = ref(false);

        const dialog_settings = () => {
            dialog_settings_visible.value = true;
        };

        const dialog_article_view_visible = ref(false);
        const dialog_article_view_content = ref('');

        const dialog_article_view = async (id = '') => {
            dialog_article_view_content.value = await fetchMD(id);
            dialog_article_view_visible.value = true;
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

        const fetchMD = async (id = '') => {
            try {
                const response = await fetch(`${id}.md`);
                const text     = await response.text();

                if(!response.ok) throw response.status;

                return marked.parse(text);
            } catch(e) {
                snackbar('MDデータのフェッチに失敗しました', 'error');
            }
        };

        const mdRender = async (id = '') => {
            document.querySelector(`#${id}`).innerHTML = await fetchMD(id);
        };

        const repos_loading = ref(false);
        const repos         = ref([]);

        const REPOS_PER_PAGE = 10;

        const loadRepos = async () => {
            try {
                repos_loading.value = true;

                const currentPage = Math.floor(repos.value.length / REPOS_PER_PAGE) + 1;

                const result = await callAPI('/repos', `per_page=${REPOS_PER_PAGE}&page=${currentPage}`);

                repos.value.push(...result);

                if(result.length >= REPOS_PER_PAGE) repos_loading.value = false;
            } catch(e) {
                logging(e);

                snackbar('エラーが発生しました', 'error');

                repos_loading.value = false;
            }
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const container_visible = ref(false);
        const developer         = ref({});

        const contents = [ 'profile', 'skills', 'works' ];

        const onLoad = async () => {
            const lenis = new Lenis({
                autoRaf: true,
                duration: 1.5
            });

            developer.value = await callAPI();

            ((l) => (l.href = developer.value.avatar_url, document.head.appendChild(l)))(document.querySelector("link[rel='icon']")             || Object.assign(document.createElement("link"), { rel: "icon" }));
            ((l) => (l.href = developer.value.avatar_url, document.head.appendChild(l)))(document.querySelector("link[rel='apple-touch-icon']") || Object.assign(document.createElement("link"), { rel: "apple-touch-icon" }));

            await loadRepos();

            container_visible.value = true;

            await nextTick();

            for(const content of contents) {
                await mdRender(content);
            }

            contents.push(...[ '', 'top', 'repositories' ]);

            setTimeout(onHashchange, 500);
        };

        const top_button_visible = ref(false);

        const onScroll = () => {
            top_button_visible.value = window.scrollY >= 50;
        };

        const navigator_visible = ref(false);

        const onResize = () => {
            navigator_visible.value = window.innerWidth >= 600;
        };

        const onHashchange = () => {
            const hash = window.location.hash.slice(1);

            if(!contents.includes(hash)) dialog_article_view(hash);
            else dialog_article_view_visible.value = false;
        };

        const theme = useTheme();

        onMounted(() => {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                theme.global.name.value = e.matches ? 'dark' : 'light';
            });

            window.addEventListener('load',       onLoad);
            window.addEventListener('scroll',     onScroll);
            window.addEventListener('resize',     onResize);
            window.addEventListener('hashchange', onHashchange);

            onResize();
        });

        const APP_VERSION = 'v1.0';
        const APP_NAME    = 'kanaaa224';

        document.title = APP_NAME;

        return {
            theme,

            APP_VERSION,
            APP_NAME,

            snackbar_visible,
            snackbar_message,
            snackbar_color,
            snackbar_time,
            snackbar,

            dialog_loading_visible,
            dialog_loading_title,
            dialog_loading_icon,
            dialog_loading,
            dialog_settings_visible,
            dialog_settings,
            dialog_article_view_visible,
            dialog_article_view_content,
            dialog_article_view,

            repos_loading,
            repos,
            loadRepos,
            developer,

            container_visible,
            top_button_visible,
            navigator_visible
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    template: `
        <v-app>
            <v-snackbar
                v-model="snackbar_visible"
                :timeout="snackbar_time"
                :color="snackbar_color"
            >{{ snackbar_message }}</v-snackbar>
            <v-dialog
                v-model="dialog_loading_visible"
                max-width="320"
                persistent
            >
                <v-list
                    class="py-2"
                    color="primary"
                    elevation="12"
                    rounded="lg"
                >
                    <v-list-item
                        :prepend-icon="dialog_loading_icon"
                        :title="dialog_loading_title"
                    >
                        <template v-slot:prepend>
                            <div class="pe-4">
                                <v-icon color="primary" size="x-large"></v-icon>
                            </div>
                        </template>
                        <template v-slot:append>
                            <v-progress-circular
                                indeterminate="disable-shrink"
                                size="16"
                                width="2"
                            ></v-progress-circular>
                        </template>
                    </v-list-item>
                </v-list>
            </v-dialog>
            <v-dialog
                v-model="dialog_settings_visible"
                transition="dialog-bottom-transition"
                fullscreen
            >
                <v-card>
                    <v-toolbar>
                        <v-toolbar-items>
                            <v-btn
                                icon="mdi-close"
                                @click="dialog_settings_visible = false"
                            ></v-btn>
                        </v-toolbar-items>
                        <v-toolbar-title>設定</v-toolbar-title>
                    </v-toolbar>
                    <v-list lines="two">
                        <v-list-subheader>アプリケーション</v-list-subheader>
                        <v-list-item
                            title="バージョン"
                            :subtitle="APP_VERSION"
                        ></v-list-item>
                        <v-divider></v-divider>
                        <v-list-item
                            class="text-center"
                            subtitle="© 2025 kanaaa224. All rights reserved."
                            link
                            href="https://kanaaa224.github.io/"
                            target="_blank"
                            rel="noopener"
                        ></v-list-item>
                    </v-list>
                </v-card>
            </v-dialog>
            <v-dialog
                v-model="dialog_article_view_visible"
                transition="dialog-bottom-transition"
                fullscreen
                data-lenis-prevent
            >
                <v-card>
                    <v-toolbar class="position-fixed" style="background-color: transparent;">
                        <v-btn
                            icon="mdi-close"
                            class="ms-auto"
                            @click="dialog_article_view_visible = false"
                            href="#works"
                        ></v-btn>
                    </v-toolbar>
                    <v-card-text v-html="dialog_article_view_content"></v-card-text>
                </v-card>
            </v-dialog>
            <v-main>
                <transition name="fade">
                    <v-container v-if="container_visible">
                        <div class="d-flex align-center justify-space-between mb-5 pa-4" style="position: sticky; top: 0; z-index: 10; backdrop-filter: blur(2rem);">
                            <p>{{ APP_NAME }}</p>
                            <div class="d-flex">
                                <div v-if="navigator_visible">
                                    <v-btn variant="plain" href="#profile">Profile</v-btn>
                                    <v-btn variant="plain" href="#skills">Skills</v-btn>
                                    <v-btn variant="plain" href="#works">Works</v-btn>
                                    <v-btn variant="plain" href="#repositories">Repositories</v-btn>
                                </div>
                                <v-btn
                                    variant="plain"
                                    @click="theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'"
                                ><v-icon>{{ theme.global.name.value === 'dark' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon></v-btn>
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
                                    ><v-icon>mdi-home</v-icon></v-btn>
                                    <v-btn
                                        icon variant="plain"
                                        target="_blank"
                                        rel="noopener"
                                        href="//github.com/kanaaa224"
                                    ><v-icon>mdi-github</v-icon></v-btn>
                                </div>
                            </div>
                        </v-card>
                        <v-card class="card-shadow pa-2 mt-10" elevation="0" rounded="lg" id="profile"></v-card>
                        <v-card class="card-shadow pa-2 mt-10" elevation="0" rounded="lg" id="skills"></v-card>
                        <v-card class="card-shadow pa-2 mt-10" elevation="0" rounded="lg" id="works"></v-card>
                        <v-card class="card-shadow pa-2 mt-10" elevation="0" rounded="lg" id="repositories">
                            <v-card-title class="text-h5">リポジトリ</v-card-title>
                            <v-list>
                                <v-list-item
                                    v-for="(repo, index) in repos"
                                    :key="repo.id"
                                    class="mx-4 px-8 py-2"
                                    :class="index % 2 === 1 ? (theme.global.current.value.dark ? 'bg-grey-darken-4' : 'bg-grey-lighten-4') : ''"
                                    rounded="lg"
                                >
                                    <div class="d-flex align-center justify-space-between">
                                        <div class="text-truncate">
                                            <v-list-item-title>{{ repo.name }}</v-list-item-title>
                                            <v-list-item-subtitle v-if="repo.description">{{ repo.description }}</v-list-item-subtitle>
                                            <v-list-item-subtitle class="grey--text text--darken-1 text-caption">
                                                最終更新: {{ new Date(repo.updated_at).toLocaleDateString() }}
                                                <span v-if="repo.language"> | 使用言語: {{ repo.language }}</span>
                                            </v-list-item-subtitle>
                                        </div>
                                        <div class="d-flex">
                                            <v-btn
                                                class="mr-2"
                                                v-if="repo.has_pages"
                                                icon
                                                variant="plain"
                                                :href="repo.homepage"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            ><v-icon>mdi-web</v-icon></v-btn>
                                            <v-btn
                                                icon
                                                variant="plain"
                                                :href="repo.html_url"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            ><v-icon>mdi-github</v-icon></v-btn>
                                        </div>
                                    </div>
                                </v-list-item>
                            </v-list>
                            <v-card-text>
                                <v-btn
                                    variant="plain"
                                    @click="loadRepos()"
                                    :disabled="repos_loading"
                                ><v-icon class="mr-1">mdi-download</v-icon>さらに読み込む</v-btn>
                                <v-btn
                                    variant="plain"
                                    href="//github.com/kanaaa224?tab=repositories"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                ><v-icon class="mr-1">mdi-github</v-icon>GitHubで確認</v-btn>
                            </v-card-text>
                        </v-card>
                    </v-container>
                </transition>
                <transition name="fade">
                    <v-btn
                        v-if="top_button_visible"
                        icon
                        variant="plain"
                        style="position: fixed; bottom: 2rem; right: 2rem; z-index: 999;"
                        href="#top"
                    ><v-icon>mdi-arrow-up</v-icon></v-btn>
                </transition>
            </v-main>
            <v-footer
                app
                class="justify-center pa-2"
                style="opacity: 0.25; background-color: transparent;"
            >
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

app.use(vuetify).mount('#app');