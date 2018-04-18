const Zomato = require('../connectors/zomato');

const run = async () => {
	const zomato = await Zomato(17852242);
	
	console.log(JSON.stringify(zomato, null, '\t'));
}
run();