const Zomato = require('../connectors/zomato');

const run = async () => {
	const zomato = await Zomato(16506111);
    
    zomato.dishes = zomato.dishes.filter(dish => !dish.title.includes(':'));

    let buffer = {};
    let actualDishes = [];
    for (const dish of zomato.dishes) {
        if (Number.isNaN(dish.price)) {
            buffer = dish;
        } else {
            if (buffer && buffer.title) {
                if (buffer.title) {
                    dish.title = buffer.title + ' ' + dish.title;
                }
                if (buffer.weight) {
                    dish.weight = buffer.weight;
                }
                if (buffer.volume) {
                    dish.volume = buffer.volume;
                }
                buffer = {};
            }
            actualDishes.push(dish);
        }
    }
    zomato.dishes = actualDishes;
	console.log(JSON.stringify(zomato, null, '\t'));
}
run();