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
                    surface:    '#222',
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
        const theme = useTheme();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const logging = (d = '') => {
            console.log(`[ ${(new Date()).toISOString()} ] ${d}`);
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

        const callAPI = async (uri = '', queries = '', requestBody = null, endpoint = API_ENDPOINTS[0]) => {
            uri = `${endpoint}${uri}`;

            if(queries) uri += /\?/.test(uri) ? `&${queries}` : `?${queries}`;

            let request = { method: 'GET' };

            if(requestBody) request = { method: 'POST', body: JSON.stringify(requestBody) };

            const response = await fetch(uri, request);
            const data     = await response.json();

            if(!response.ok) throw `api-bad-status: ${response.status}`;

            return data;
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
            repos_loading.value = true;

            const currentPage = Math.floor(repos.value.length / REPOS_PER_PAGE) + 1;

            const result = await callAPI('/repos', `per_page=${REPOS_PER_PAGE}&page=${currentPage}`);

            repos.value.push(...result);

            if(result.length >= REPOS_PER_PAGE) repos_loading.value = false;
        };

        const user = ref({});

        const initialize = async () => {
            const lenis = new Lenis({
                autoRaf: true,
                duration: 1.5
            });

            user.value = { name: 'Kanato Shimabukuro', login: 'kanaaa224', avatar_url: 'https://avatars.githubusercontent.com/u/61834337' };//await callAPI();

            //await loadRepos();

            document.querySelector("link[rel='icon']").href             = user.value.avatar_url;
            document.querySelector("link[rel='apple-touch-icon']").href = user.value.avatar_url;

            logging(`initialized`);
        };

        const container_visible  = ref(false);
        const navigator_visible  = ref(false);
        const top_button_visible = ref(false);

        onMounted(() => {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                theme.global.name.value = e.matches ? 'dark' : 'light';
            });

            window.addEventListener('load', async () => {
                await initialize();

                container_visible.value = true;

                await nextTick();

                const contents = [ 'profile', 'skills', 'works' ];

                for(const content of contents) {
                    await mdRender(content);
                }

                contents.push(...[ '', 'top', 'repositories' ]);

                const onHashchange = () => {
                    const hash = window.location.hash.slice(1);

                    if(!contents.includes(hash)) dialog_article_view(hash);
                    else dialog_article_view_visible.value = false
                }

                setTimeout(() => {
                    onHashchange();
                }, 500);

                window.addEventListener('hashchange', onHashchange);
            });

            window.addEventListener('scroll', e => {
                top_button_visible.value = window.scrollY >= 50;
            });

            const onResize = () => {
                navigator_visible.value = window.innerWidth >= 600;
            };

            onResize();

            window.addEventListener('resize', onResize);
        });

        return {
            theme,

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
            user,

            loadRepos,

            container_visible,
            navigator_visible,
            top_button_visible
        };
    }
});

app.use(vuetify).mount('#app');