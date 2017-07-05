//tinyAppProject/express_server.js

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true})); //allows us to access POST request parameters

app.set("view engine", "ejs"); //tells the express app to use EJS as its templating engine


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase }; //variables we can access in urls_index
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urls: urlDatabase }; //variables we can access in urls_show
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;         // store the long url from the form (urls/new)
  const shortURL = generateRandomString();  // generate a short url using our function, and store it
  urlDatabase[shortURL] = longURL;          // add our "consts" into the urlDatabase object as a new key value pair
  res.redirect(`urls/${shortURL}`);         // redirect to urls/shorturl(id)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};


