# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs. Users can see all of their previously shortened URLs neatly collected and stored for them, and can link with confidence, knowing that their shortened URLs cannot be altered, deleted, or reassigned by anyone but themselves.

## Final Product

!["Our registration page"](https://github.com/MadelineCollier/tinyAppProject/blob/master/docs/:register.png?raw=true)
!["Our login page"](https://github.com/MadelineCollier/tinyAppProject/blob/master/docs/:login.png?raw=true)
!["A homepage, featuring a list of URLs belonging to whichever user is logged in."](https://github.com/MadelineCollier/tinyAppProject/blob/master/docs/:urls.png?raw=true)
!["The editing page for a particular short URL, in this case b2xVn2. On this page, the user can reassign b2xVn2 so that it links to a new long URL"](https://github.com/MadelineCollier/tinyAppProject/blob/master/docs/:urls:id.png?raw=true)
!["The page where a user can shorten a new URL"](https://github.com/MadelineCollier/tinyAppProject/blob/master/docs/:urls:new.png?raw=true)
!["Here, a user is denied access to an editing page that is specific to a particular short URL. This is because they are not logged in. They will also be denied access if the URL does not belong to them."](https://github.com/MadelineCollier/tinyAppProject/blob/master/docs/access%20denied.png?raw=true)

## Dependencies


- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

