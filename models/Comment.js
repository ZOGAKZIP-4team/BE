import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema (
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
        },
        nickname: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    },
    {
        versionKey: false 
    }
)

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;