import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxLength:100},email:{type:String,required:true,unique:true,lowercase:true,trim:true,index:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:['customer','admin'],default:'customer',index:true},status:{type:String,enum:['active','disabled'],default:'active',index:true},failedLoginAttempts:{type:Number,default:0,min:0},lockUntil:{type:Date,default:null}},{timestamps:true});
export const User=mongoose.model('User',schema);
