const {
    spawn
} = require('child_process');
const fs = require('fs');
const fetch = require('node-fetch');

const highlightWords = ['hovězím', 'lasagne', 'risotto', 'drůbeží', 'játra', 'vepřová', 'vepřový', 'rizek', 'řízek', 'tresky', 'spaghetti', 'kuřecí', 'kuře', 'hovězí', 'camembert', 'stir-fry', 'omeleta', 'vepřové', 'burger', 'guláš', 'curry', 'svíčková', 'rybí', 'losos', 'biftečky', 'kachní', 'krkovice', 'jehněčí', 'kebab', 'guláš', 'steak', 'slanině', 'krůtí', 'smažený eidam', 'smažený syr', 'slaninou', 'anglickou', 'hovězího', 'játýrka'];
const highlight = (str) => {
    highlightWords.forEach(word => {
        str = str.replace(new RegExp('('+word+') ', 'gi'), '<b>$1</b> ');
    });
    return str;
};
const highlightSlack = (str) => {
    highlightWords.forEach(word => {
        str = str.replace(new RegExp('('+word+') ', 'gi'), '*$1* ');
    });
    return str;
};

const runRestaurantRetrievalScript = function (script) {
    return new Promise(function (resolve, reject) {
        const ls = spawn('node', ['./restaurants/' + script]);

        let allData = '';

        ls.stdout.on('data', (data) => {
            allData += data;
        });

        ls.stderr.on('data', (data) => {
            reject(data);
        });

        ls.on('close', (code) => {
            if (code === 0) {
                resolve(JSON.parse(allData));
            }
        });
    });
}
const getRestaurantScripts = () => new Promise(resolve => {
    fs.readdir('./restaurants', function (err, items) {
        resolve(items);
    });
});
const _formatPrice = (val) => {
    return typeof val === 'string' ? val : (val ? val + " Kč" : "")
};
const _formatWeight = (val) => {
    return val ? val + ' grams' : '';
};
const _formatVolume = (val) => {
    return val ? val + ' liters' : '';
};
const _googleMapsDirections = location => {
    return "https://www.google.com/maps/dir/50.0773574,14.4164055/"+location.latitude + ',' + location.longitude+"/"
};
const sendGoogleChat = async (restaurant) => {
    let sections = [];
    sections.push({
        widgets: [{
            "image": {
                "imageUrl": restaurant.image
            }
        }]
    });
    let section = {
        header: restaurant.name,
        widgets: []
    }
    section.widgets = restaurant.dishes.map(dish => {
        let weightOrVolume = '';
        if (dish.weight) {
            weightOrVolume = _formatWeight(dish.weight);
        } 
        if (dish.volume) {
            weightOrVolume = _formatVolume(dish.volume);
        }
        return {
            "keyValue": {
                "content": highlight(dish.title),
                "bottomLabel": _formatPrice(dish.price),
                "topLabel": weightOrVolume,
                "contentMultiline": true
            }
        };
    });
    const buttonWidget = {
        "buttons": []
    };
    if (restaurant.location) {
        buttonWidget.buttons.push({
            "imageButton": {
                "icon": "MAP_PIN",
                "onClick": {
                    "openLink": {
                        "url": _googleMapsDirections(restaurant.location)
                    }
                }
            }
        });
    }
    buttonWidget.buttons.push({
        "imageButton": {
            "icon": "RESTAURANT_ICON",
            "onClick": {
                "openLink": {
                    "url": restaurant.web
                }
            }
        }
    });
    section.widgets.push(buttonWidget);
    sections.push(section);
    const response = await fetch('https://chat.googleapis.com/v1/spaces/AAAAeVWzz54/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=BiM0UeHAPs9YiWcA_A-Pb-9Aw6FqwhqEZin3GhfTPlQ%3D', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            "cards": [{
                "sections": sections
            }]
        })
    });
    console.log(await response.text());
};
const sendSlack = async (restaurant) => {
    // const attachments = restaurant.dishes.map(dish => {
    //     const attachment = {
    //         fallback: dish.title,
    //         fields: [
    //             {
    //                 value: highlightSlack(dish.title),
    //                 short: false
    //             }
    //         ]
    //     };
    //     if (dish.price) {
    //         attachment.fields.push({
    //             value: _formatPrice(dish.price),
    //             short: true
    //         });
    //     }
    //     if (dish.weight) {
    //         attachment.fields.push({
    //             value: _formatWeight(dish.weight),
    //             short: true
    //         });
    //     }
    //     if (dish.volume) {
    //         attachment.fields.push({
    //             value: _formatVolume(dish.volume),
    //             short: true
    //         });
    //     }
    //     return attachment;
    // });
    const attachment = {
        fallback: '',
        fields: restaurant.dishes.map(dish => {
            return {
                title: _formatPrice(dish.price),
                value: highlightSlack(dish.title) + '\n\n',
                short: false
            };
        }),
        actions: [
        ]
    };
    attachment.actions.push({
        type: 'button',
        text: 'Website',
        url: restaurant.web
    });
    if (restaurant.location) {
        attachment.actions.push({
            type: 'button',
            text: 'Directions',
            url: _googleMapsDirections(restaurant.location)
        });
    }
    
    const attachments = [attachment];
    console.log('going to call ohok');
    const response = await fetch('https://hooks.slack.com/services/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', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            username: restaurant.name,
            icon_url: restaurant.image,
            attachments: attachments
        })
    });
    console.log(await response.text());
};

const time = t => new Promise(r => { setTimeout(r, t) });

const run = async () => {
    const restaurantScripts = await getRestaurantScripts();
    restaurantScripts.forEach(script => {
        Promise.all([runRestaurantRetrievalScript(script), time(0 + Math.random() * 1000)]).then(result => {
            [restaurant] = result;
            sendGoogleChat(restaurant);
            sendSlack(restaurant);
        }).catch(err => {
            console.log(script, 'failed');
            console.error(err);
        });
    })
};
run();
