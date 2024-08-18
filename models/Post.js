import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    groupId: {
        type: Number,
        required: true
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
        type: [String],
        required: true 
    },
    location: {
        type: String,
        required: true
    },
    moment: {
        type: Date,
        required: true
    },
    isPublic: {
        type: Boolean,
        required: true
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
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);
export default Post;
