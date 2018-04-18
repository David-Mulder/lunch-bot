const OgHttp = require('../connectors/og-http');

const run = async () => {
    const {document, restaurant} = await OgHttp('http://www.staropramen.cz/hospody/restaurace-praha-resslova');
    
    const dishesEl = document.querySelector('#denni-menu dt.is-open').nextElementSibling;
    restaurant.dishes = Array.from(dishesEl.querySelectorAll('li')).map(dishEl => ({
        title: dishEl.querySelector('.menu-list__name').textContent.replace('Tip šéfkuchaře:', ''),
        price: parseFloat(dishEl.querySelector('.menu-list__price').textContent)
    }));
    restaurant.name = 'Potrefena Husa (Staropramen)'
	console.log(JSON.stringify(restaurant, null, '\t'));
};
run();