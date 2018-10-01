const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/userManagement', {useNewUrlParser: true}); // userManagement is the db name
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('db connected'));

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    address: String,
    Age: Number,
});

const monUser = mongoose.model('userCollection', userSchema);

function addCollection() {
    clients.json;
}