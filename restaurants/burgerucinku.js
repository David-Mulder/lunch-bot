const Zomato = require('../connectors/zomato');

const run = async () => {
	const zomato = await Zomato(16507155);

	console.log(JSON.stringify(zomato, null, '\t'));
}
run();