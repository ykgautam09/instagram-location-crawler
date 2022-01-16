const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const logger = require('morgan');
const scrapper = require('./module/scrape')



// configurations
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(logger('dev'));

// public folder
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// Routes
app.get('/', (req, res) => {
    res.send("send request to /scrap/< instagram_username > to start scrapping data")
})

app.get('/scrap/:username', (req, res) => {
    let username = req.params.username;
    scrapper(username)
    res.send("data will be ready in few minutes")
})

// Server Set-up
app.listen(process.env.SERVER_PORT || '5000', (err) => {
    if (err) console.log(err)
    console.log(`Server Up and Running at http://localhost:${process.env.SERVER_PORT || 5000}/`);
})

module.exports = app;