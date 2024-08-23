import mongoose from 'mongoose';
import { DATABASE_URL } from '../env.js';
import Image from '../models/ImageUpload.js';


mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB!!')).catch(err => console.log(err));

await Image.deleteMany({}); 
await Image.insertMany(seedData); 


mongoose.connection.close();
