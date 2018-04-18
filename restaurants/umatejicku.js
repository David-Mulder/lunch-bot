const Zomato = require('../connectors/zomato');
const { upperCaseFirstLetter } = require('../utils/string');

const run = async () => {
	
	const zomato = await Zomato(16506077);
	
	const actualDishes = [];
	const soupSectionEnd = "DNES KE KAŽDÉMU HLAVNÍMU CHODU POLÉVKA ZA";
	const bannedWords = ["STRAVENKOU", "VŘELE VÁM DOPORUČUJEME", "HOTOVÉ POKRMY"];
	let allowAdding = false;
	let soupSection = true;
	for (const dish of zomato.dishes) {
		if (dish.title === soupSectionEnd) {
			actualDishes.forEach(dish => {
				dish.price += 'Kč (' + dish.price + 'Kč s Lunch Menu)';
			});
		} else if (bannedWords.some(bannedWord => dish.title.toLowerCase().includes(bannedWord.toLowerCase()))) {
			allowAdding = false;
		} else if (!Number.isNaN(dish.price)) {
			actualDishes.push({
				title: upperCaseFirstLetter(dish.title.toLowerCase()),
				price: dish.price,
				weight: dish.weight
			});
			allowAdding = true;
		} else if (allowAdding === true) {
			actualDishes[actualDishes.length - 1].title += ' ' + dish.title.toLowerCase();
			allowAdding = false;
		}
	}
	zomato.dishes = actualDishes;
	console.log(JSON.stringify(zomato, null, '\t'));
	
}
run();