import mongoose from 'mongoose';
import moment from 'moment-timezone';

const PostSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    nickname: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    postPassword: {
        type: String,
        required: true
    },
    groupPassword: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true 
    },
    location: {
        type: String,
        required: true
    },
    moment: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Seoul').toDate()
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: () => moment().tz('Asia/Seoul').toDate()
    }
},
{
    versionKey: false 
});

const Post = mongoose.model('Post', PostSchema);
export default Post;
