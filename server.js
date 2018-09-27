const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const jsonFile = __dirname + '/clients.json';

const app = express();
const port = process.env.PORT || 5000; // L11
app.use(express.json()); // L11
app.use(express.urlencoded({ extended: true})); // L11
mongoose.connect('mongodb://localhost/userManagement', {useNewUrlParser: true}); // userManagement is the db name // L11

const db = mongoose.connection; // L11
db.on('error', console.error.bind(console, 'connection error:')); // L11
db.once('open', function () {
    console.log('db connected');
}); // L11

const userSchema = new mongoose.Schema({ // L11
    userId: String,
    firstName: String,
    lastName: String,
    email: String,
    address: String,
    Age: String,
    // age: { type: Number, min: 18, max: 70 },
    // createDate: {type: Date, default: Date.now}
}); // L11

const monUser = mongoose.model('userCollection', userSchema); // userCollection is the db collection name // L11
//const monUser = mongoose.model('mongoClientsMTECH', userSchema); // userCollection is the db collection name // L11

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/clientTable', (req, res) => { // /clientTable
    //pulls back all docs in the userCollection
    monUser.find({}, (err, docs) => {
        if (err) console.log(err);
        res.render('clientTable', {clients: docs});
    });
});

app.post('/clientTable', (req, res) => {
    console.log(`POST /clientTable: ${JSON.stringify(req.body)}`); // L11
    const newUser = new monUser();
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = req.body.email;
    newUser.address = req.body.address;
    newUser.age = req.body.age;
    newUser.save((err, data) => {
        if (err) {
            return console.log(err);
            res.send(`done ${data}`);
        }
    }); // L11
}); // test Code

app.get('/edit/:clientId', (req, res) => { // /edit/*clientID* Page
    //since this is a get request, all we need to get is the user data
    //so first, we grab the clientId from the params
    const clientId = req.params.clientId;
    //after that, we can then search the mongo data base to find the user
    //we use the 'findOne()' method to search until found model
    //that way we dont search the entire thing, just what we need
    monUser.findOne({_id:clientId}, (err, doc) => {
        if (err) console.log(err);
        //let returnData = `user name : ${clientId} doc : ${doc}`;
        res.send(`EditPage | User were editing: ${doc}`);
        //res.send('/edit/:clientId', _id.clientId ${doc});
    });
});

app.post('/edit/:clientId', (req, res) => {
    //first, lets grab the clientId that we passed through:
    const clientID = req.params.clientId;
    //to make our lives easier, and not have to define variables for each field
    //we can just make an object to pass through
    //we can also define body so we dont have to type 'req.body' so many times
    const body = req.body;
    const updatedUserData = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        age: body.age
    };
    //so instead of doing multiple fields and guessing to find the correct user,
    //you can use the clientId we passed through to search the database.
    monUser.findOneAndUpdate({_id:clientID}, updatedUserData, {new: true}, (err, data) => {
        if (err) console.log(err);
        res.send(`Return data: ${updatedUserData}`);
    });
});

app.get('/delete/:clientId', (req, res) => {
    const clientId = req.params.clientId;
    monUser.findOneAndDelete({'_id': clientId}, (err, data) => {
        if (err) return console.log(`Oops! ${err}`);
        res.redirect('/clientTable');
        //let returnData = `User Removed : ${clientId} Removed data : ${data}`;
        //res.send(returnData);
        //res.send(`/delete/:clientId: ${data}`);
        //res.send('/delete/:clientId',{_id: data});
        //res.send({_id: data});
    });
});

app.listen(5000, () => {
    console.log('Listening on port 5000');
});


