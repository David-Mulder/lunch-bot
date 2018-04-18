const { upperCaseFirstLetter } = require('../utils/string');
const OgHttp = require('../connectors/og-http');

const run = async () => {
    const {document, restaurant} = await OgHttp('http://www.lemon.cz/menu-cz/lunch-menu/');
    
    const priceElements = document.querySelectorAll('.inner-bg.lunchtable dd');
    const prices = {
        'Polévka': priceElements[0].textContent,
        'Lunch 1': parseInt(priceElements[1].textContent),
        'Lunch 2': parseInt(priceElements[2].textContent),
        'Lunch 3': parseInt(priceElements[3].textContent)
    };
    
    const heading = document.querySelector('.nadpis-menu.day-now');
    node = heading.nextElementSibling;
    restaurant.dishes = [];
    do{
        const type = node.querySelector('h3 span').textContent;
        const title = upperCaseFirstLetter(node.querySelector('p').textContent.toLowerCase());
        const price = prices[type];
        restaurant.dishes.push({
            title: title,
            price: price
        });
        node = node.nextElementSibling;
    } while(node && node.className === 'food-item price-right');

	console.log(JSON.stringify(restaurant, null, '\t'));
};
run();