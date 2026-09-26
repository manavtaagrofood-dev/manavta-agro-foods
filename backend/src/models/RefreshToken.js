import mongoose from 'mongoose';
const schema=new mongoose.Schema({tokenHash:{type:String,required:true,unique:true,index:true},user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},expiresAt:{type:Date,required:true},revokedAt:{type:Date},replacedBy:{type:mongoose.Schema.Types.ObjectId,ref:'RefreshToken'}},{timestamps:true});
schema.index({expiresAt:1},{expireAfterSeconds:0});
export const RefreshToken=mongoose.model('RefreshToken',schema);
