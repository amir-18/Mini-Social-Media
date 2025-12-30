import mongoose from "mongoose";

const PostSchema = mongoose.Schema({
    Postname: String,
    content : String,
    UserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
   comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt : {
        type : Date,
        default : Date.now
    }
})

export default mongoose.model('Post',PostSchema)