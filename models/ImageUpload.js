import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true
    }
},
{
    versionKey: false 
}
);

const Image = mongoose.model('Image', imageSchema);
export default Image;