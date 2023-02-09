const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser : true,
    useUnifiedTopology : true
})

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Databasee connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author : '63e24adbb1ad21c94087e150' ,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}`,
            image : 'https://source.unsplash.com/collection/483251',
            description : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis enim veritatis culpa quis corporis provident ratione officiis ullam voluptatem repellendus nulla iure non nemo laboriosam quae, eum omnis aut accusamus.",
            price
        });
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})