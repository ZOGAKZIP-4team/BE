import mongoose from 'mongoose';

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
        default: Date.now
    }
},
{
    versionKey: false 
}
);

const Post = mongoose.model('Post', PostSchema);
export default Post;