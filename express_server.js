//tinyAppProject/express_server.js





//REQUIREMENTS SECTION...





const express = require("express");
const app = express();
// default port 8080
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
//allows us to access POST request parameters
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  userId: 'session',
  keys: ['doggos', 'bork']
}));
//tells the express app to use EJS as its templating engine
app.set("view engine", "ejs");





//GLOBAL OBJECTS/VARS SECTION...





//object with list of shortened urls
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userId: "userRandomID"
  }
};




//object with user info
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("foo", 10)
  }
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
  let newUrl = givenURL;
  if (!/https?:\/\//.test(givenURL)) {
    if (!/www\./.test(givenURL)) {
      newUrl = `www.${newUrl}`;
    }
    newUrl = `https://${newUrl}`;
  }
  return newUrl;
};

//used to generate our short urls randomly
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
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
  if (bcrypt.compareSync(givenPass, users[getIdByEmail(givenEmail)].password)) {
    return true;
  }
  return false;
};

//creates a custom list of urls to display, based on the given user id
const urlsForUser = (givenId) => {
  const output = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userId === givenId) {
      output[url] = urlDatabase[url];
    }
  }
  return output;
};





//ROUTING SECTION...





//greetings!
app.get("/", (req, res) => {
  if (!req.session.userId){
    res.redirect("/login");
    return;
  } else {
    res.redirect("/urls");
  }
});


//hey there
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


//hey jason
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//page which presents the login form
app.get("/login", (req, res) => {
  let userEmail = getUserEmailById(req.session.userId);
  let templateVars = { userEmail: userEmail };
  res.render("login", templateVars);
});


//creates userId session once the login form is filled out
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
    req.session.userId = id;
    res.redirect("/urls");
  }
});


//deletes the userId session (effectively loggin out the user)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//page with form for registering a new user
app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
    return;
  } else {
    let userEmail = getUserEmailById(req.session.userId);
    let templateVars = { userEmail: userEmail };
    res.render("register", templateVars);
  }
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
      password: bcrypt.hashSync(req.body.password, 10)
    };
    users[newUser.id] = newUser;
    req.session.userId = newUser.id;
    res.redirect("/urls");
    return;
  } else {
    res.status(400).send('Both password and email fields must be filled out');
  }
});



//page which presents the form for shortening a new url
//if user is not logged in, they are redirected to /login
app.get("/urls/new", (req, res) => {
  let userEmail = getUserEmailById(req.session.userId);
  let templateVars = { userEmail: userEmail };
  if (templateVars.userEmail === undefined) {
    res.redirect("/login");
    return;
  } else {
    res.render("urls_new", templateVars);
  }
});


//page which presents the full list of urls present in the urlDatabase at present time
app.get("/urls", (req, res) => {
  let userEmail = getUserEmailById(req.session.userId);
  //variables we can access in urls_index template
  let templateVars = {
    userEmail: userEmail,
    urls: urlsForUser(req.session.userId)
  };
  if (!req.session.userId) {
    res.status(401).send('You are not logged in');
  } else {
    res.render("urls_index", templateVars);
  }
});


//creates a new short url for a given long url, and stores these in urlDatabase
app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('You are not logged in');
    return;
  } else {
    // store the long url from the form (urls/new)
    let longURL = addProtocol(req.body.longURL);
    // generate a short url using our function, and store it
    const shortURL = generateRandomString();
    // add this info into the urlDatabase object as new key value pairs
    urlDatabase[shortURL] = {
      url: longURL,
      userId: req.session.userId
    };
    // redirect to urls/shorturl(id)
    res.redirect(`urls/${shortURL}`);
  }
});


//deletes a given long/shortURL pair from the urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
    return;
  } else {
    res.status(400).send('You do not have permission to delete that URL');
  }
});


//id specific page for each short url
//now also allows for user to update (explained in next routing, below)
app.get("/urls/:id", (req, res) => {
  //variables we can access in urls_show
  let templateVars = {
    userEmail: getUserEmailById(req.session.userId),
    urls: urlDatabase,
    shortURL: req.params.id,
    sessionID: req.session.userId
  };
  if (urlDatabase[req.params.id] === undefined) {
    res.status(404).send("Not Found");
  } else {
    res.render("urls_show", templateVars);
  }
});


//resets a given short url to link to a new/different long url
app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    let longURL = addProtocol(req.body.longURL);
    urlDatabase[req.params.id].url = longURL;
    res.redirect("/urls");
  } else {
    res.status(400).send('You do not have permission to edit that URL');
  }
});


//redirects users from short url to long (actual) url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send("No URL exists for this ID");
    return;
  } else {
    let longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  }
});


//listen up, pal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

