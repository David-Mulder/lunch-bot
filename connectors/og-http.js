const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fetch = require('node-fetch');

module.exports = async function(url) {
    const response = await fetch(url);
    const dom = new JSDOM(await response.text());
    const window = dom.window;
    const document = window.document;
    return {
        dom: dom,
        window: window,
        document: document,
        restaurant: {
            name: document.querySelector('meta[property="og:site_name"]').getAttribute('content'),
            image: document.querySelector('meta[property="og:image"]').getAttribute('content'),
            web: document.querySelector('meta[property="og:url"]').getAttribute('content')
        }
    };
};