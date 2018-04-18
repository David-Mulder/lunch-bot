const fetch = require('node-fetch');
module.exports = async function(id) {
    const [dailyMenuResponse, restaurantDetailResponse] = await Promise.all([fetch('https://developers.zomato.com/api/v2.1/dailymenu?res_id='+id, {
		headers: {
			'Accept': 'application/json',
			'user_key': 'de225fa7b89deb480d61f69db5753ad4'
		}
	}), fetch('https://developers.zomato.com/api/v2.1/restaurant?res_id='+id, {
		headers: {
			'Accept': 'application/json',
			'user_key': 'de225fa7b89deb480d61f69db5753ad4'
		}
	})]);
    const [dailyMenuResponseBody, restaurantDetailResponseBody] = await Promise.all([dailyMenuResponse.text(), restaurantDetailResponse.text()]);
    const parsedDailyResponseBody = JSON.parse(dailyMenuResponseBody);
    const parsedRestaurantDetailResponseBody = JSON.parse(restaurantDetailResponseBody);
    
    let dishes = [];
    if (parsedDailyResponseBody.daily_menus.length > 0) {
        // check date
        const dailyMenu = parsedDailyResponseBody.daily_menus[0].daily_menu;
        dishes = dailyMenu.dishes.map(dish => {
            newDish = {
                title: dish.dish.name.trim(),
                price: parseInt(dish.dish.price)
            };

            let weightFinder = new RegExp('([0-9]+) ?gr?(am)?', 'i');
            const weightFinderResult = weightFinder.exec(newDish.title);
            
            if (weightFinderResult) {
                newDish.weight = parseInt(weightFinderResult[1]);
                newDish.title = newDish.title.replace(weightFinder, '').trim();
            }

            let volumeFinder = new RegExp('([0-9,.]+) ?l(iter)?', 'i');
            const volumeFinderResult = volumeFinder.exec(newDish.title);
            
            if (volumeFinderResult) {
                newDish.volume = parseFloat(volumeFinderResult[1].replace(',','.'));
                newDish.title = newDish.title.replace(volumeFinder, '').trim();
            }

            return newDish;
        });
    } else {

    }
    return {
        name: parsedRestaurantDetailResponseBody.name,
        location: parsedRestaurantDetailResponseBody.location,
        dishes,
        image: parsedRestaurantDetailResponseBody.featured_image,
        web: 'https://www.zomato.com/widgets/daily_menu?entity_id=' + id
    };
    
}