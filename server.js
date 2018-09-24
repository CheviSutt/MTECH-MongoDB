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
    Age: String
    // age: { type: Number, min: 18, max: 70 },
    // createDate: {type: Date, default: Date.now}
}); // L11

// const monUser = mongoose.model('userCollection', userSchema); // userCollection is the db collection name // L11
const monUser = mongoose.model('mongoClientsMTECH', userSchema); // userCollection is the db collection name // L11


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/clientTable', (req, res) => {
    fs.readFile(jsonFile, 'utf8', (err, data) => {
        if (err) console.log(err);
        let jsonData = JSON.parse(data);
        res.render('clientTable', {clients: jsonData.clients});
    });
});

app.post('/clientTable', (req, res) => {

    console.log(`POST /clientTable: ${JSON.stringify(req.body)}`); // L11
    const newUser = new monUser();
    newUser.userId = req.body.userId;
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.email = req.body.email;
    newUser.address = req.body.address;
    newUser.age = req.body.age;
    newUser.save((err, data) => {
        if (err) {
            return console.log(`new user save: ${data}`);
            res.send(`done ${data}`);
        }
    }); // L11

    fs.readFile(jsonFile, 'utf8', (err, data) => { // reads clients,json
    if (err) console.log(err);
    let index = 0; // unique id
    let jsonData = JSON.parse(data);
    let clientObj = {
        userId: 0, // unique id
        //userId: req.body.userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        address: req.body.address,
        age: req.body.age
    };

    jsonData.clients.forEach(user => { // unique id block
        if (user.userId === index) index++;
    });
    clientObj.userId = Number(index); // unique id

    jsonData.clients.push(clientObj);
    res.render('clientTable', {clients: jsonData.clients}); // rendering clientTable html

    fs.writeFile(jsonFile, JSON.stringify(jsonData), 'utf8', err => console.log(err));
    });
});

app.get('/edit/:clientId', (req, res) => { // Routes to edit page

    let userID = req.params.userId;
    let userFirstName = req.params.firstName; // this is to access value of parameter // L11
    let userLastName = req.params.lastName;
    let userEmail = req.params.email;
    let userAddress = req.params.address;
    let userAge = req.params.age;
    console.log(`GET /edit/:clientId ${JSON.stringify(req.params)}`);
    user.findOne(
        {userId: userID},
        {firstName: userFirstName},
        {lastName: userLastName},
        {email: userEmail},
        {address: userAddress},
        {age: userAge}), (err, data) => {
        if (err) return console.log(`opps! ${err}`);
        console.log(`data -- ${JSON.stringify(data)}`);
        let returnData = `User ID : ${userID} First Name : ${userFirstName} Last Name : ${userLastName}  Email : ${userEmail} Address : ${userAddress} Age : ${userAge}`;
        console.log(returnData);
        res.send(returnData);
    }; // L11

    let clientId = req.params.clientId;
    let forEachCallBack = (index, jsonData) => {
        console.log(jsonData.clients[index]);
        res.render('edit', {client: jsonData.clients[index]}); // .userId to populate single user
    }
    fs.readFile(jsonFile, 'utf8', (err, data) => {
        if (err) console.log(err);

        let jsonData = JSON.parse(data);

        jsonData.clients.forEach((user, index) => {
            if (Number(user.userId) === Number(clientId)) {
                forEachCallBack(index, jsonData);
            }
        });
    });
});

app.post('/edit/:clientId', (req, res) => {

    console.log(`POST /edit: ${JSON.stringify(req.body)}`); // L11
    let matchedID = req.body.userId;
    let matchedFirstName = req.body.firstName;
    let matchedLastName = req.body.lastName;
    let matchedEmail = req.body.email;
    let matchedAddress = req.body.address;
    let matchedAge = req.body.age;
    monUser.findOneAndUpdate(
        {userId: matchedID},
        {firstName: matchedFirstName},
        {lastName: matchedLastName},
        {email: matchedEmail},
        {address: matchedAddress},
        {age: matchedAge}),
        {new: true}, (err, data) => {
        if(err) return console.log(`Oops! ${err}`);
        console.log(`data -- ${data.role}`);
        let returnData = ` New user ID : ${matchedID} New First Name : ${matchedFirstName} New Last Name : ${matchedLastName} New Email : ${matchedEmail} New Address : ${matchedAddress} New Age : ${matchedAge}`;
        console.log(returnData);
        res.send(returnData);
    }; // L11

    //console.log(req);
    let clientId = req.params.clientId;
    let user = {
        userId: req.body.userId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        age: req.body.age
    };

    let forEachCallBack = (index, jsonData) => {
        jsonData.clients[index] = user;
        fs.writeFile(jsonFile, JSON.stringify(jsonData), (err) => {
            if (err) throw err;
        });
        res.render('clientTable', {clients: jsonData.clients});
    }

    fs.readFile(jsonFile, 'utf8', (err, data) => {
        if (err) console.log(err);

        let jsonData = JSON.parse(data);

        jsonData.clients.forEach((user, index) => {
            if (Number(user.userId) === Number(clientId)) {
                forEachCallBack(index, jsonData);
            }
        });
    });
});

app.get('/delete/:clientId', (req, res) => {

        console.log(`POST /delete/:clientId ${JSON.stringify(req.params)}`); // L11
        let matchedID = req.params.clientId;
        monUser.findOneAndDelete(
            {clientId: matchedID},
            (err, data) => {
                if (err) return console.log(`data -- ${JSON.stringify(data)}`);
                let returnData = `User Removed : ${matchedID} Removed data : ${data}`;
                console.log(returnData);
                res.send(returnData);
            }); // L11

    let clientId = req.params.clientId;
    let forEachCallBack = (index, jsonData) => {
        jsonData.clients.splice(index,1);
        // console.log(jsonData);
        res.redirect('/clientTable');
        fs.writeFile(jsonFile, JSON.stringify(jsonData), (err) => {
            if (err) throw err;
        });
    }

    fs.readFile(jsonFile, 'utf8', (err, data) => {
        if (err) console.log(err);

        let jsonData = JSON.parse(data);

        jsonData.clients.forEach((user, index) => {
            if (Number(user.userId) === Number(clientId)) {
                forEachCallBack(index, jsonData);
            }
        });
    });
});

// app.post('/delete/:clientId', (req, res) => {
//     console.log(`POST /delete/:clientId ${JSON.stringify(req.params)}`); // L11
//     let matchedID = req.params.clientId;
//     monUser.findOneAndDelete(
//         {clientId: matchedID},
//         (err, data) => {
//             if (err) return console.log(`data -- ${JSON.stringify(data)}`);
//             let returnData = `User Removed : ${matchedID} Removed data : ${data}`;
//             console.log(returnData);
//             res.send(returnData);
//         }); // L11
// });

// Test Mongo Delete code below
// app.post('/delete/:clientId', (req, res) => {
//     console.log(`POST /delete/:clientId ${JSON.stringify(req.body)}`); // L11
//     let matchedID = req.params.clientId;
//     monUser.findOneAndDelete(
//         {clientId: matchedID},
//         (err, data) => {
//             if (err) return console.log(`data -- ${JSON.stringify(data)}`);
//             let returnData = `User Removed : ${matchedID} Removed data : ${data}`;
//             console.log(returnData);
//             res.send(returnData);
//         }); // L11
// });

// Test Mongo Delete code below
// console.log(`POST /delete/:clientId: ${JSON.stringify(req.body)}`); // L11
// let matchedID = req.params.clientId;
// // let matchedFirstName = req.body.firstName;
// // let matchedLastName = req.body.lastName;
// // let matchedEmail = req.body.email;
// // let matchedAddress = req.body.address;
// // let matchedAge = req.body.age;
// monUser.findOneAndDelete(
// // monUser._deleteMany(
//     {userId: matchedID},
//     // {firstName: matchedFirstName},
//     // {lastName: matchedLastName},
//     // {email: matchedEmail},
//     // {address: matchedAddress},
//     // {age: matchedAge},
//     (err, data) => {
//     if (err) return console.log(`data -- ${JSON.stringify(data)}`);
//     let returnData = `User Removed : ${matchedID} Removed data : ${data}`;
//     console.log(returnData);
//     res.send(returnData);
//        // let returnMsg = `User Removed : ${matchedID} removed data : ${data}`;
//        //  console.log(returnMsg);
//        //  res.send(returnMsg);
// }); // L11

app.listen(5000, () => {
    console.log('Listening on port 5000');
});


