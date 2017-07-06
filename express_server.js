//tinyAppProject/express_server.js





//REQUIREMENTS SECTION...





const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true})); //allows us to access POST request parameters
app.use(cookieParser());
app.set("view engine", "ejs"); //tells the express app to use EJS as its templating engine





//GLOBAL OBJECTS/VARS SECTION...





//object with list of shortened urls
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    user_id: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    user_id: "userRandomID"
  },
};




//object with user info
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};





//FUNCTIONS SECTION...





//gets a userEmail by the id, returns null if user id not found
const getUserEmailById = (userID) => {
  let user = users[userID];
    if (!user) {
      return;
    }
  return user.email;
};

//gets a userID by the email
const getIdByEmail = (givenEmail) => {
  let id = undefined;
  for(user in users) {
    if (users[user].email === givenEmail) {
      id = user;
    }
  }
  return id;
};

//fixes a bug, where https sites need their protocol in order to link properly
const addProtocol = (givenURL) => {
  if (!/https?:\/\//.test(givenURL)) { givenURL = `https:${givenURL}`};
  return givenURL;
};

//used to generate our short urls randomly
const generateRandomString = () => {
  return Math.random().toString(36).substr(2,6);
};

//checks to see if an email already exists in our global users object
const checkUserEmail = (givenEmail) => {
  for(user in users) {
    if (users[user].email === givenEmail) {
      return true;
    }
  }
  return false;
};

//checks to see if password and email match in our global users object
const checkPassword = (givenEmail, givenPass) => {
  if (users[getIdByEmail(givenEmail)].password === givenPass) {
    return true;
  }
  return false;
};





//ROUTING SECTION...





//greetings!
app.get("/", (req, res) => {
  res.end("Hello!");
});


//page which presents the form for shortening a new url
//if user is not logged in, they are redirected to /login
app.get("/urls/new", (req, res) => {
  let userEmail = getUserEmailById(req.cookies["user_id"]);
  let templateVars = { userEmail: userEmail };
  if (templateVars.userEmail === undefined) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});


//hey jason
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//page with form for registering a new user
app.get("/register", (req, res) => {
  let userEmail = getUserEmailById(req.cookies["user_id"]);
  let templateVars = { userEmail: userEmail };
  res.render("register", templateVars);
});


//creates a new user in the global userobject (if the form is filled correctly)
app.post("/register", (req, res) => {
  if (checkUserEmail(req.body.email)) {
    res.status(400).send('Email already exists');
    return;
  } else if (req.body.email && req.body.password) {
  let newUser = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password
  };
  users[newUser.id] = newUser;
  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
  } else {
    res.status(400).send('Both password and email fields must be filled out');
  }
});


//page which presents the login form
app.get("/login", (req, res) => {
  let userEmail = getUserEmailById(req.cookies["user_id"]);
  let templateVars = { userEmail: userEmail };
  res.render("login", templateVars);
});


//creates user_id cookie once the login form is filled out
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = getIdByEmail(email);

  if (!checkUserEmail(email)) {
    res.status(403).send('Sorry, email or password incorrect');
    return;
  } else if (!checkPassword(email, password)) {
    res.status(403).send('Sorry, email or password incorrect');
    return;
  } else {
    res.cookie("user_id", id);
    res.redirect("/");
  }
});


// //deletes the cookie (effectively loggin out the user)
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


//page which presents the full list of urls present in the urlDatabase at present time
app.get("/urls", (req, res) => {
  let userEmail = getUserEmailById(req.cookies["user_id"]);
  let templateVars = { userEmail: userEmail, urls: urlDatabase }; //variables we can access in urls_index template
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
  let userEmail = getUserEmailById(req.cookies["user_id"]);
  let templateVars = {
    userEmail: userEmail,
    urls: urlDatabase,
    shortURL: req.params.id
  }; //variables we can access in urls_show
  res.render("urls_show", templateVars);
});


//resets a given short url to link to a new/different long url
app.post("/urls/:id", (req, res) => {
  let longURL = addProtocol(req.body.longURL);
  urlDatabase[req.params.id].url = longURL;
  res.redirect("/urls");
});


//hey there
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


//creates a new short url for a given long url, and stores these in urlDatabase
app.post("/urls", (req, res) => {
  let longURL = addProtocol(req.body.longURL);  // store the long url from the form (urls/new)
  const shortURL = generateRandomString();      // generate a short url using our function, and store it
  urlDatabase[shortURL] = {
    url: longURL,
    user_id: req.cookies["user_id"],
  }
  console.log(urlDatabase);                                            // add info into the urlDatabase object as a new key value pair
  res.redirect(`urls/${shortURL}`);             // redirect to urls/shorturl(id)
});


//redirects users from short url to long (actual) url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});


//listen up, pal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

