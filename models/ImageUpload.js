import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
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

const Image = mongoose.model('Image', imageSchema);
export default Image;
