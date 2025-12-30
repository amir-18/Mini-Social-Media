📝 Node.js Blog Application (EJS + JWT)

This project is a full-stack blog application built using Node.js, Express, MongoDB, JWT authentication, and EJS for the frontend.
It demonstrates authentication, authorization, post management, likes, comments, and profile handling using server-side rendering.

📌 Code Explanation (How This Project Works)
Authentication

Users can register and log in

Passwords are hashed using bcrypt

A JWT token is generated on login/signup

Token is stored in cookies

Middleware handles:

Logged-in user detection

Route protection

Redirecting unauthorized users

Posts

Authenticated users can:

Create posts

Edit & delete only their own posts

Like / unlike posts

Comment on posts

Posts are linked to users using Mongoose relationships

Pages (EJS)

home.ejs → Shows all posts

profile.ejs → Shows user’s own posts

login.ejs & register.ejs → Auth pages

edit.ejs → Edit post

CreatePost.ejs → Create post

error.ejs → Global error handling

The main landing page of the app is:

/home

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/amir-18/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

2️⃣ Install Node Dependencies
npm install

3️⃣ Database Setup

Make sure MongoDB is running locally or via MongoDB Atlas.
Your connection should look like:

mongoose.connect("mongodb://127.0.0.1:27017/blogApp");

4️⃣ Run the Server
npm start


Server will run on:

http://localhost:4000


Open the application using:

http://localhost:4000/home

🧾 Conclusion

This project focuses on practical backend development, covering:

Authentication & authorization

Secure password handling

Database relationships

Route protection

Server-side rendering with EJS

It is built for learning and skill-building, not production use.

🔧 Possible Improvements

Move JWT secret to environment variables

Add input validation & sanitization

Secure cookies (httpOnly, secure)

Split routes & controllers (MVC structure)

👤 Author

Amir Abid
GitHub: https://github.com/amir-18

LinkedIn: https://www.linkedin.com/in/amir-abid-b54aa8361/
