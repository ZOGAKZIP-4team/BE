import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        password: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        likeCount: {
            type: Number,
        },
        badges: {
            type: Array,
        },
        postCount: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        introduction: {
            type: String,
        }
    },
    {
        versionKey: false 
    }
);

const Group = mongoose.model('Group', GroupSchema);

export default Group;