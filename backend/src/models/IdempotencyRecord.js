import mongoose from 'mongoose';
const schema=new mongoose.Schema({scope:{type:String,required:true,unique:true,index:true},status:{type:Number,required:true},body:{type:mongoose.Schema.Types.Mixed},expiresAt:{type:Date,required:true}},{timestamps:true});
schema.index({expiresAt:1},{expireAfterSeconds:0});
export const IdempotencyRecord=mongoose.model('IdempotencyRecord',schema);
