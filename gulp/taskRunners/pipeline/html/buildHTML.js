const {BASE_URL} = require('../../variables.js');
const jsdom = require('jsdom');
const hljs = require('highlight.js');
const {JSDOM} = jsdom;

const concatHeadAndMain = (contentDOM, layoutDOM) => {
    const contentHeadElement = contentDOM.window.document.querySelector('head');
    const layoutHeadElement = layoutDOM.window.document.querySelector('head');
    layoutHeadElement.innerHTML += contentHeadElement.innerHTML;
    const contentMainElement = contentDOM.window.document.querySelector('main');
    const layoutMainElement = layoutDOM.window.document.querySelector('main');
    layoutMainElement.innerHTML = contentMainElement.innerHTML;
};

const addAnchorToHeader = (layoutDOM) => {
    const headerElementList = layoutDOM.window.document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    Array.prototype.forEach.call(headerElementList, (element) => {
        const normalizedValue = element.innerHTML
            .toLowerCase()
            .replace(/\s/gi, '_');
        const startHeaderNumber = parseInt(element.tagName.slice(1));
        const anchorIcon = '#'.repeat(startHeaderNumber);
        const anchorTag = `<a class="anchor" aria-label="Anchor" data-anchor-icon="${anchorIcon}" href="#${normalizedValue}"></a>`;
        element.innerHTML = `${anchorTag}${element.innerHTML}`;
        element.setAttribute('id', normalizedValue);
    });
};

const replaceUrl = (layoutDOM, canonicalUrl) => {
    const urlElementList = layoutDOM.window.document.querySelectorAll('[src],[href],[data-share-endpoint]');
    Array.prototype.forEach.call(urlElementList, (element) => {
        const href = element.getAttribute('href');
        const src = element.getAttribute('src');
        const endpoint = element.getAttribute('data-share-endpoint');
        if (href && href.match(/(BASE_URL|CANONICAL_URL)/)) {
            element.setAttribute('href', href
                .replace(/BASE_URL/, BASE_URL)
                .replace(/CANONICAL_URL/, canonicalUrl)
            );
        }
        if (src && src.match(/(BASE_URL|CANONICAL_URL)/)) {
            element.setAttribute('src', src
                .replace(/BASE_URL/, BASE_URL)
                .replace(/CANONICAL_URL/, canonicalUrl)
            );
        }
        if (endpoint && endpoint.match(/(BASE_URL|CANONICAL_URL)/)) {
            element.setAttribute('data-share-endpoint', endpoint
                .replace(/BASE_URL/, BASE_URL)
                .replace(/CANONICAL_URL/, canonicalUrl)
            );
        }
    });
};

const addLdJson = (layoutDOM, canonicalUrl) => {
    const headElement = layoutDOM.window.document.querySelector('head');
    const scriptElement = layoutDOM.window.document.createElement('script');
    scriptElement.setAttribute('type', 'application/ld+json');
    scriptElement.innerHTML = JSON.stringify({
        "@context": "http://schema.org",
        "@type": "Webpage",
        "url": canonicalUrl,
        "name": "Silverbirder's portfolio",
        "headline": "Show my portfolio",
        "description": "My contents is self intro, blog, projects, and books.",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": BASE_URL
        },
        "publisher": {
            "@type": "Person",
            "name": "silverbirder",
            "logo": {
                "url": "https://res.cloudinary.com/silverbirder/image/upload/c_scale,w_520/v1611128736/silver-birder.github.io/assets/logo.png",
                "width": 520,
                "height": 520,
                "@type": "ImageObject"
            }
        }
    });
    headElement.appendChild(scriptElement);
};

const highlight = (layoutDOM) => {
    const codeElementList = layoutDOM.window.document.querySelectorAll('pre code');
    Array.prototype.forEach.call(codeElementList, (element) => {
        hljs.highlightBlock(element);
    });
};

const replaceEmbed = (layoutDOM) => {
    const result = layoutDOM.window.document.evaluate('//*[contains(text(), \':embed\')]', layoutDOM.window.document, null, 0, null);
    while (true) {
        const element = result.iterateNext();
        if (element === null) {
            break;
        }
        const embedRegex = new RegExp("\\[(?<url>[^\\[]+):embed]");
        const embedMatch = element.innerHTML.match(embedRegex);
        if (!(embedMatch && embedMatch.groups && embedMatch.groups.url)) {
            continue;
        }
        const url = embedMatch.groups.url;
        const ampEmbedlyCardTag = `
                <amp-embedly-card
                    media="(prefers-color-scheme: dark)"
                    data-url="${url}"
                    layout="responsive"
                    data-card-theme="dark"
                    width="100"
                    height="50">
                </amp-embedly-card>
                <amp-embedly-card
                        media="(prefers-color-scheme: light)"
                        data-url="${url}"
                        layout="responsive"
                        data-card-theme="light"
                        width="100"
                        height="50">
                </amp-embedly-card>`;
        element.innerHTML = element.innerHTML.replace(embedRegex, ampEmbedlyCardTag);
    }
};

const replaceTableContent = (layoutDOM) => {
    const result = layoutDOM.window.document.evaluate('//*[contains(text(), \'[:contents]\')]', layoutDOM.window.document, null, 0, null);
    const element = result.iterateNext();
    if (element === null) {
        return;
    }
    const toc = require('toc');
    const mainElement = layoutDOM.window.document.querySelector('main');
    const headers = toc.anchorize(mainElement.innerHTML, {tocMin: 1, anchorMin: 1}).headers.map((header) => {
        header.anchor = header.attrs.match(/id="(?<id>[^"]+)"/).groups.id;
        return header;
    });
    element.innerHTML = toc.toc(headers, {TOC: '<div class="table-of-contents"><%= toc %></div>'});
};

const buildHTML = (content, layout, canonicalUrl) => {
    const contentDOM = new JSDOM(content);
    const layoutDOM = new JSDOM(layout);
    concatHeadAndMain(contentDOM, layoutDOM);
    addAnchorToHeader(layoutDOM);
    replaceUrl(layoutDOM, canonicalUrl);
    addLdJson(layoutDOM, canonicalUrl);
    highlight(layoutDOM);
    replaceEmbed(layoutDOM);
    replaceTableContent(layoutDOM);
    return layoutDOM.serialize();
};

exports.buildHTML = buildHTML;
