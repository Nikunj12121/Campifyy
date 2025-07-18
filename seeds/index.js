const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/campify_final',{
 //   useNewUrlParser : true,
    // useCreateIndex:true,
    // useUnifiedTopology:true
});

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async()=>{
    await Campground.deleteMany({});    //deleted before if any present,

    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author        : '684d29c3bdd5d173e4b9acca',
            location      : `${cities[random1000].city},${cities[random1000].state}`,
            title         : `${sample(descriptors)} ${sample(places)}`,
            description   : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt, velit cupiditate voluptatem pariatur aliquam alias molestias dolore corrupti iure esse sed atque vel quis, nam impedit maiores. Possimus, placeat neque! ',
            price,
            images        :  [
    {
      url: 'https://res.cloudinary.com/dk1migr8k/image/upload/v1749972920/Campify/kl0gom8gvjavqaorhs7o.jpg',
      filename: 'Campify/kl0gom8gvjavqaorhs7o',
      
    },
    {
      url: 'https://res.cloudinary.com/dk1migr8k/image/upload/v1749972924/Campify/d2dgujmfmd9aaxh37oak.jpg',
      filename: 'Campify/d2dgujmfmd9aaxh37oak',
      
    },
    {
      url: 'https://res.cloudinary.com/dk1migr8k/image/upload/v1749972925/Campify/yoizt30fkta0eyawsrm7.jpg',
      filename: 'Campify/yoizt30fkta0eyawsrm7',
      
    }
  ]
            
        })
        await camp.save();
    }

}
seedDB().then(()=>{
    mongoose.connection.close();
})