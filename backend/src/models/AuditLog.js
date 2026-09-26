import mongoose from 'mongoose';
const schema=new mongoose.Schema({actor:{type:mongoose.Schema.Types.ObjectId,ref:'User',index:true},action:{type:String,required:true,index:true},resource:{type:String,required:true,index:true},resourceId:{type:String,index:true},metadata:{type:mongoose.Schema.Types.Mixed,default:{}},requestId:{type:String,index:true}},{timestamps:true});
schema.index({createdAt:-1});
export const AuditLog=mongoose.model('AuditLog',schema);
