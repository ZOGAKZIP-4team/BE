import mongoose from "mongoose";
import mock from './mock.js';
import Group from '../models/Group.js';
import Post from '../models/Post.js';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DATABASE_URL);

await Group.deleteMany({});
await Group.insertMany(mock.groupsData);

await Post.deleteMany({});
await Post.insertMany(mock.postsData);

mongoose.connection.close();