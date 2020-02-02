# Fritter
Build your own not-quite-[Twitter](https://twitter.com/)!

## Starter Code
This app skeleton was created using [Express Generator](https://expressjs.com/en/starter/generator.html).

The GUI for Part I is provided in the `public` folder. Edit `public/javascripts/services.js` to send requests to your API. Edit `public/index.html` if you need to add inputs.

## Attacks

### SQL injection
This attack existed in my Fritter. To prevent against that, I took advantage of the database's escape ability. I changed the queries to be, for example, included as:
'''
database.query('UPDATE freets SET message= ? WHERE id= ?', [newMessage, id])
'''

This uses the databases natural escaping mechanism to detect SQL injections. I also changed the query function in database.js to take in another parameter for the attributes.

### Cross-Site Scripting
My site did not have this vulnerability. This is because I was using Vue's double brackets to reactively display the texts of the user inputs. Since Vue automatically sanitizes the texts if you use the double brackets, the injected code does not render, but rather displays as plain text on the screen.

### Bad Authentication
My site did have this vulnerability. To overcome this, I used the bcrypt library. I hashed all of the passwords before passing them into the database by using: 
'''
const password = bcrypt.hashSync(user.password, salt);
'''
And to compare the hashed password with the plaintext for log ins, I used:
'''
bcrypt.compareSync(text, hash);
'''
This prevented the passwords from being taken as plaintext from the database.

### Integrity Violation
My site did not have this vulnerability. I was able to avoid this problem because I recursively deleted all of the freets that a user was responsible for at the moment that the user was deleted. This way, the freets were completely gone, not just hanging around with no owner. This prevented them from being hijacked because they are deleted with their user.

### CSRF
My site did have this problem. To fix this, I used the csurf library. By using it, I was able to save a csrf taken to the session that needed to be matched upon making a POST, PUT, or DELETE api call. The token was only passed onto these requests if the call was make from the interface. In this way, no malicious website could pass code to the users browser, and make an api call to Fritter piggy-backing off of the credentials of the already signed in session.
This code can be seen in
'''
getCSRF() at line 124
lines 90 I store it in the header
line 92 in createAccount() I make the axios request
and the input DOM is in line 5
'''



## Database Design
users(\_name_, password, loggedIn)

| name | password | loggedIn |
| -----|----------|--------- |
|string| string   | binary   |

freets(\_id_, author, message, votes, refreeterID)

| id   | author   | message  | votes | refreeterID |
| -----|----------|--------- |-------|-------------|
|string| string   | string   | int   |  string     |

follows(\_userID_, \_followerID_)

| userID   | followerID   |
| ---- | -------- |
|string| string   |

upvotes(\_user_, \_freetID_)

| user   | freetID   |
| -----|----------|
|string| string   |

downvotes(\_user_, \_freetID_)

| user   | freetID   |
| -----|----------|
|string| string   |

My databases take advantage of normal form due to the fact that they:
* have unique sets of primary keys
* each column is atomic
* the entire primary key is descripbed by the columns in each of the tables
* Exclusively the primary keys are described in the tables

I chose to set up my databases this way in order to separate all of my concerns, and provide discrete databases that are required for all of my operations. The users are cleanly taken care of in _users_, and using the primary keys there, we can find all of the users' freets in _freets_. 
In addition, to take care of the following feature of my fritter, I included another table to keep persistent storage of all of the follow relationships. That way all of the features of the followers can be easily executed.
Finally, I have two tables, one for downvotes, and another for upvotes. These two tables are used to keep track of which freets have been up or down voted by each user, and they are also used to prevent a user from voting multiple times.

--
-- Table structure for table `downvotes`
--

CREATE TABLE IF NOT EXISTS `downvotes` (
  `user` varchar(30) NOT NULL,
  `freetID` varchar(30) NOT NULL,
  PRIMARY KEY (`user`,`freetID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE IF NOT EXISTS `follows` (
  `userID` varchar(30) NOT NULL,
  `followerID` varchar(30) NOT NULL
  PRIMARY KEY (`userID`,`followerID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `freets`
--

CREATE TABLE IF NOT EXISTS `freets` (
  `id` varchar(30) NOT NULL,
  `author` varchar(30) NOT NULL,
  `message` varchar(140) NOT NULL,
  `votes` int(11) NOT NULL,
  `refreeterID` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `id`
--

CREATE TABLE IF NOT EXISTS `id` (
  `id` int(11) NOT NULL DEFAULT '0'
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- --------------------------------------------------------

--
-- Table structure for table `upvotes`
--

CREATE TABLE IF NOT EXISTS `upvotes` (
  `user` varchar(30) NOT NULL,
  `freetID` varchar(30) NOT NULL,
  PRIMARY KEY (`user`,`freetID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `name` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL,
  `loggedIn` tinyint(1) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


## Changes to server-side code
While I made very minimal changes to the server side code, I did change a few of the API paths and I added two additional ones.

Changes:
* Included checking for freet of length 140
* added and updates some error messages
* Changes upvote and downvote to be POST methods
* changes "change username" path to be more intuitive
* changed create user path
* changed "get freets from user" path
New Server Side Code:
* Made call to check if a user is signed in
* Made call to check if a specified user exists.

## Design Decisions

### Client Side Separation of Concerns
In the design of my code, each of the important groupings of HTML elements were separated into different components. I did this in order to make displaying them upon certain conditions very easy form the higher level perspective. My tree of Vue components is as follows:
* App.vue
    * UserSettings.vue
        * SignInCreateAccount.vue
        * SignOutDeleteAccount.vue
        * ChangeUsernamePassword.vue
    * FreetControls.vue
    * CreateFreetForm.vue
    * FreetList.vue
        * Freet.vue

### Server Side Separation of Concerns
I divided my api calls into two general catagories; Users and Freets. Due to this, I created two separate route files. In the `routes/users.js` file, I provided the implementation for the various operations that involved the user. These include:
* Creating a user
* Changing a username
* Changing a password
* Logging in
* Logging out
* Deleting a user

All of my operations that involve freets are implemented in the `routes/freets.js` file. These include:
* Viewing all freets
* Viewing all freets from a specified author
* Creating a Freet
* Editing a Freet
* Deleting a freet
* Upvoting a freet
* Downvoting a freet

### API paths
* Creating a user - `/api/users`
* Changing a username - `/api/users/:id/username`
* Changing a password - `/api/users/password`
* Logging in - `/api/users/login`
* Logging out - `/api/users/logout`
* Deleting a user - `/api/users/delete`
* Viewing all freets - `/api/freets`
* Viewing all freets from a specified author - `/api/users/:author/freets`
* Creating a Freet - `/api/freets`
* Editing a Freet - `/api/freets/edit/:id`
* Deleting a freet - `/api/freets/delete/:id`
* Upvoting a freet - `/api/freets/upvote`
* Downvoting a freet - `/api/freets/downvote`
* Check user exists - `/api/users/exists/:author`
* Check if user is signed in - `/api/users/isSignedIn`

### REST Usage
I used the following REST verbs for each action:
* GET : view freets, view freets by author
* PUT : change password, change username
* POST : create user, sign in, sign out, create freet, upvote, downvote
* DELETE : delete user, delete freet

### Abstraction
In addition, I created an object called Users for each of the users. This kept track of each users' information. I created an object called Freets for each of the freets that was created. The database of freets and users is simply stored in a dictionary and list respectively.

