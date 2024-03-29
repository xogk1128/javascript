const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/relationshipDemo')
    .then(()=>{
        console.log("CONNECTION OPEN!!");
    })
    .catch((err)=>{
        console.log("OH NO ERROR!!!!");
        console.log(err);
    });

const  userSchema = new mongoose.Schema({
    first : String,
    last : String,
    addresses : [
        {
            _id : {id : false},
            street : String,
            city : String,
            state : String,
            country : {
                type : String,
                required : true
            }
        }
    ]
});

const User = mongoose.model('User', userSchema);

const makeUser = async () =>{
    const u = new User({
        first : 'Harry',
        last : 'Potter'
    })
    u.addresses.push({
        street : '123 Sesame St.',
        city : 'New York',
        state : 'NY',
        country : 'USA'
    })

    const res = await u.save();
    console.log(res);
}

const addAddress = async (id) => {
    const user = await User.findById(id);
    user.addresses.push({
        street : '99 3rd St.',
        city : 'New York',
        state : 'NY',
        country : 'USA'
    })
    const res = await user.save();
    console.log(res);
}

addAddress('63d5060b8e79b985e3f61956');