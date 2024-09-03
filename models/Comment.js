import mongoose from "mongoose";
import moment from 'moment-timezone';

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
            default: () => moment().tz('Asia/Seoul').toDate()
        },
    },
    {
        versionKey: false 
    }
)

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
