//tinyAppProject/express_server.js

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true})); //allows us to access POST request parameters
app.use(cookieParser());
app.set("view engine", "ejs"); //tells the express app to use EJS as its templating engine


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




//greetings!
app.get("/", (req, res) => {
  res.end("Hello!");
});

//page which presents the form which allows you to shorten a new url
//(the actual functionality of shortening is in a different routing)
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//hey jason
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//creates a cookie once the header's login form is filled out
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// //deletes the cookie (effectively loggin out the user)
// app.post("/login", (req, res) => {
//   let username = req.body.username;
//   res.cookie("username", username);
//   res.redirect("/urls");
// });

//page which presents the full list of urls present in the urlDatabase at present time
app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase }; //variables we can access in urls_index template
  res.render("urls_index", templateVars);
});

//deletes a given long/shortURL pair from the urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//id specific page for each short url
//now also allows for user to update (explained in next routing, below)
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, username: req.cookies["username"], urls: urlDatabase }; //variables we can access in urls_show
  res.render("urls_show", templateVars);
});

//resets a given short url to link to a new/different long url
app.post("/urls/:id", (req, res) => {
  let longURL = addProtocol(req.body.longURL);
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

//hey there
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


//creates a new short url for a given long url, and stores these in urlDatabase
app.post("/urls", (req, res) => {
  let longURL = addProtocol(req.body.longURL);         // store the long url from the form (urls/new)
  const shortURL = generateRandomString();  // generate a short url using our function, and store it
  urlDatabase[shortURL] = longURL;          // add our "consts" into the urlDatabase object as a new key value pair
  res.redirect(`urls/${shortURL}`);         // redirect to urls/shorturl(id)
});

//redirects users from short url to long (actual) url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//listen up, pal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//fixes a bug, where https sites need their protocol in order to link properly
const addProtocol = (givenURL) => {
  if (givenURL !== /^https?:\/\//) { givenURL = `https:${longURL}`};
  return givenURL;
}

//used to generate our short urls randomly
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};


