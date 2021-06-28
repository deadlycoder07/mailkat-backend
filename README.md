<h1 align="center">
  <br>
  <a><img src="https://github.com/deadlycoder07/mailkat-backend/blob/master/public/logo.png" width="200"></a>
  <br>  
MailKat
  <br>
</h1>

<p align="center">
   <br>
  <a><img src="https://blog.hyperiondev.com/wp-content/uploads/2018/09/Blog-Article-MERN-Stack.jpg" width="800"></a>
  <br> 
</p>

<h3 align="center">A simple Mailing and Mail Scheduling App.</h3>

## Description
MailKat is a MERN-based full-stack web app where users can register and login to send recurring and scheduled mails to the recipients.
MailKat has options for custom as well as google sign-in methods. User can create mails, edit them and schedule the mails as well as send recurring mails.
The scheduling can be done in different ways like-
1. Recurring Schedule
2. Weekly Schedule
3. Monthly Schedule
4. Yearly Schedule 
 The Editor has features of bold, italics, image insert, print option, code view, save option and many more.
 ## Features
 * MailKat features Login and signup via Username - password as well as Gmail Sync (Login with Gmail).
 * A Home page that has the list of all the mails scheduled for future.
 * A History Page that has the list of mails sent till now.
 * Create new mail, Edit it with MailKat's own Text Editor.
 
 ## Mail Features
* To
* CC
* Subject
* Schedule Selector
* Mail Body
* Send Mail Button
## Architecture Diagram
<p align="center">
   <br>
  <a><img src="https://github.com/deadlycoder07/mailkat-backend/blob/master/public/Screenshot%202021-06-27%20at%2012.23.57%20AM.png" width="800"></a>
  <br> 
</p>

## Installation and Setup
* ### Clone the repository 
```Bash
git clone https://github.com/deadlycoder07/mailkat-backend.git && cd mailkat-backend
```
* ### Install dependencies
```Bash
npm install
```

* ### Create .env and add the environment variable values as mentioned in .env.example

```
cp .env.example .env
```

* ### Start the Application
```Bash
npm start
```
 
* ### The app gets hosted by default at port 8000.

