import { marked } from 'https://cdn.jsdelivr.net/npm/marked@17.0.1/+esm';

import snackbar from './app-snackbar.js';

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

export const md_fetch = async (id = '') => {
    try {
        const response = await fetch(`${id}.md?t=${Date.now()}`);
        const text     = await response.text();

        if(!response.ok) throw response.status;

        return marked.parse(text);
    } catch(e) {
        console.error(e);

        await snackbar.show('ページデータのフェッチに失敗しました', 'error');
    }
};

/* export const md_render = async (id = '') => {
    document.querySelector(`#${id}`).innerHTML = await md_fetch(id);
}; */