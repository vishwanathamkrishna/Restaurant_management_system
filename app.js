const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');

// const mongoConnect = require('./util/database').mongoConnect;

const db = require('./util/database');
 
const User = require('./models/user');

// const MONGODB_URI = 'mongodb+srv://kvishwa1:Snow123456@cluster0.58aot.mongodb.net/shop';

const MONGODB_URI = 'mongodb+srv://kvishwa1:Snow123456@cluster0.58aot.mongodb.net/shop'

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
    secret: 'my secret', 
    resave:false, 
    saveUninitialized: false, 
    store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use((req,res,next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.use('/admin', adminRoutes); 
app.use(shopRoutes);
app.use(authRoutes);
 
app.use(errorController.get404);

var PORT = process.env.PORT || 5000;
mongoose.connect(MONGODB_URI)
.then(result => {
    // User.findOne().then(user => {
    //     if(!user) {
    //         const user = new User({
    //             name: 'Krishna',
    //             email: 'krishna@gmail.com',
    //             cart: {
    //                 items: []
    //             }
    //         });
    //         user.save();
    //     } 
    //})
    
    app.listen(PORT, () => {
        console.log("Server is up and Application is running on port number "+PORT);
    });
}).catch(err => {
    console.log(err);
});





