import mongoose from "mongoose";
import data from './mock.js';
import Group from '../models/Group.js';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DATABASE_URL);

await Group.deleteMany({});
await Group.insertMany(data);

mongoose.connection.close();