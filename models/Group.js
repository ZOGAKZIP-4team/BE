import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: false
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        likeCount: {
            type: Number,
            default: 0
        },
        badges: {
            type: Array,
            required: false
        },
        postCount: {
            type: String,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        introduction: {
            type: String,
            required: true
        }
    },
    {
        versionKey: false 
    }
);

const Group = mongoose.model('Group', GroupSchema);

export default Group;