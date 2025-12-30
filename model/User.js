import mongoose  from "mongoose";
mongoose.connect('mongodb://localhost:27017/Social-Platform');

const UserSchema = mongoose.Schema({
    username: String,
    email: String,
    age: Number,
    password : String,
    post : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
});

export default mongoose.model('User',UserSchema);       