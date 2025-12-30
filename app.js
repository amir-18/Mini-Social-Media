import cookieParser from 'cookie-parser';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from './model/User.js';
import PostModel from './model/Post.js';

const app = express();

// --- SETTINGS ---
app.set('view engine', 'ejs');
app.listen(4000, () => console.log("Server is running on port 4000"));

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to check if user is authenticated
const IsAuth = (req, res, next) => {
    req.user = null;
    const token = req.cookies.token;
    if (!token) return next();
    try {
        req.user = jwt.verify(token, 'token');
    } catch (err) {
        console.log(err);
    }
    next();
};

// Middleware to redirect if already logged in
const LoggedIN = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return next();
    try {
        jwt.verify(token, 'token');
        res.redirect('/home');
    } catch (err) {
        next();
    }
};

// Middleware to protect private routes
const AuthCheck = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
        const data = jwt.verify(token, 'token');
        req.user = data;
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// --- AUTH ROUTES ---

app.get('/register', LoggedIN, (req, res) => {
    res.render('register');
});

app.get('/login', LoggedIN, (req, res) => {
    res.render('login');
});

app.post('/SignUp', async (req, res, next) => {
    const { email, username, age, password } = req.body;
    try {
        const CheckUser = await UserModel.findOne({ email });
        if (CheckUser) {
            const err = new Error("User Already Exists");
            err.statusCode = 400;
            return next(err);
        }

        const Salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, Salt);
        const User = await UserModel.create({
            email,
            username,
            age,
            password: hashedPassword
        });

        const token = jwt.sign({ email, username, UserId: User._id }, 'token');
        res.cookie('token', token);
        res.redirect('/home');
    } catch (err) {
        next(err);
    }
});

app.post('/SignIn', async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const User = await UserModel.findOne({ email });
        if (!User) {
            const err = new Error("User doesn't exist");
            err.statusCode = 400;
            return next(err);
        }

        const CheckPassword = await bcrypt.compare(password, User.password);
        if (CheckPassword) {
            const token = jwt.sign({ email, username: User.username, UserId: User._id }, 'token');
            res.cookie('token', token);
            res.redirect('/home');
        } else {
            const err = new Error("Incorrect Password");
            err.statusCode = 400;
            return next(err);
        }
    } catch (err) {
        next(err);
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// --- POST ROUTES ---

app.get('/createpost', AuthCheck, (req, res) => {
    res.render('CreatePost');
});

app.post('/post/create', AuthCheck, async (req, res, next) => {
    const { Postname, content } = req.body;
    try {
        const NewPost = await PostModel.create({
            Postname,
            content,
            UserId: req.user.UserId
        });
        const User = await UserModel.findById(req.user.UserId);
        User.post.push(NewPost._id);
        await User.save();
        res.redirect('/home');
    } catch (err) {
        next(err);
    }
});

app.get('/home', IsAuth, async (req, res, next) => {
    try {
        const posts = await PostModel.find({})
            .populate('UserId', 'username')
            .populate('comments.user', 'username');
        
        let user = null;
        if (req.user) {
            user = await UserModel.findById(req.user.UserId);
        }
        res.render('home', { user, posts });
    } catch (err) {
        next(err);
    }
});

app.get('/Like/:id', AuthCheck, async (req, res, next) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (post.likes.indexOf(req.user.UserId) == -1) {
            post.likes.push(req.user.UserId);
        } else {
            post.likes.splice(post.likes.indexOf(req.user.UserId), 1);
        }
        await post.save();
        res.redirect('/home');
    } catch (err) {
        next(err);
    }
});

app.post('/comment/:id', AuthCheck, async (req, res, next) => {
    try {
        const post = await PostModel.findById(req.params.id);
        if (!post) {
            const err = new Error("Post not found");
            err.statusCode = 404;
            return next(err);
        }
        post.comments.push({
            text: req.body.comment,
            user: req.user.UserId
        });
        await post.save();
        res.redirect('/home');
    } catch (err) {
        next(err);
    }
});

app.post('/update/:id', AuthCheck, async (req, res, next) => {
    const { postname, content } = req.body;
    try {
        await PostModel.findByIdAndUpdate(req.params.id,
            { $set: { content: content, postname: postname } },
            { new: true, runValidators: true }
        );
        res.redirect('/home');
    } catch (err) {
        next(err);
    }
});

app.get('/profile', AuthCheck, async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.UserId);
        const posts = await PostModel.find({ UserId: req.user.UserId });
        res.render('profile', { user, posts });
    } catch (err) {
        next(err);
    }
});

app.get('/edit/:id', AuthCheck, async (req, res, next) => {
    try {
        const posts = await PostModel.findById(req.params.id);
        const user = await UserModel.findById(req.user.UserId);
        if (posts.UserId == req.user.UserId) {
            return res.render('edit', { user, posts });
        } else {
            const err = new Error("This isn't your post");
            err.statusCode = 403;
            return next(err);
        }
    } catch (err) {
        next(err);
    }
});

app.get('/deletepost/:id', AuthCheck, async (req, res, next) => {
    try {
        const post = await PostModel.findById(req.params.id);
        const user = await UserModel.findById(req.user.UserId);

        if (!post) {
            const err = new Error("Post Doesn't Exist");
            err.statusCode = 404;
            return next(err);
        }

        if (post.UserId.toString() !== req.user.UserId.toString()) {
            const err = new Error("The post isn't yours");
            err.statusCode = 403;
            return next(err);
        }

        await post.deleteOne();
        user.post.pull(req.params.id);
        await user.save();
        res.redirect('/profile');
    } catch (err) {
        next(err);
    }
});

// --- GLOBAL ERROR MIDDLEWARE ---
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`[ERROR] ${statusCode}: ${message}`);

    res.status(statusCode).render('error', { 
        message, 
        error: process.env.NODE_ENV === 'development' ? err : {} 
    });
});