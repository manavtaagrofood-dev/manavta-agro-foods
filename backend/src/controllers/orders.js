import mongoose from 'mongoose'; import {Order} from '../models/Order.js'; import {Product} from '../models/Product.js'; import {orderSchema,statusSchema} from '../validators/schemas.js'; import {ok,fail} from '../utils/api.js'; import {getPagination,paginationMeta} from '../utils/pagination.js'; import {audit} from '../services/auditService.js';
export async function create(req,res){
 const d=orderSchema.parse(req.body); const session=await mongoose.startSession();
 try { let created;
  await session.withTransaction(async()=>{
   const ids=d.items.map(i=>new mongoose.Types.ObjectId(i.productId)); const products=await Product.find({_id:{$in:ids},active:true}).session(session); const map=new Map(products.map(p=>[String(p._id),p])); const items=[]; let subtotal=0;
   for(const i of d.items){const p=map.get(i.productId); if(!p)throw Object.assign(new Error('Product not found'),{statusCode:404,code:'PRODUCT_NOT_FOUND'}); if(p.stock<i.quantity)throw Object.assign(new Error(`Insufficient stock for ${p.name}`),{statusCode:409,code:'INSUFFICIENT_STOCK'}); const unitPrice=Number(p.price||0); const line=unitPrice*i.quantity; subtotal+=line; items.push({product:p._id,name:p.name,quantity:i.quantity,unitPrice,lineTotal:line});}
   for(const i of items){const updated=await Product.findOneAndUpdate({_id:i.product,stock:{$gte:i.quantity}},{$inc:{stock:-i.quantity}},{new:true,session}); if(!updated)throw Object.assign(new Error('Stock changed during order; please retry'),{statusCode:409,code:'STOCK_CONFLICT'});}
   [created]=await Order.create([{customer:req.user._id,items,totals:{subtotal,total:subtotal,currency:'INR'},statusHistory:[{status:'PENDING',changedBy:req.user._id}]}],{session});
  });
  await audit({actor:req.user._id,action:'CREATE',resource:'Order',resourceId:created.id,requestId:req.id}); return ok(res,created,201);
 } finally { await session.endSession(); }
}
export async function list(req,res){const {page,limit,skip}=getPagination(req.query); const filter=req.user.role==='admin'?{}:{customer:req.user._id}; const [rows,total]=await Promise.all([Order.find(filter).sort({createdAt:-1}).skip(skip).limit(limit).lean(),Order.countDocuments(filter)]); return ok(res,rows,200,paginationMeta({page,limit,total}));}
export async function get(req,res){const o=await Order.findById(req.params.id).lean(); if(!o)return fail(res,'Order not found',404,'ORDER_NOT_FOUND'); if(req.user.role!=='admin'&&String(o.customer)!==String(req.user._id))return fail(res,'Forbidden',403,'FORBIDDEN'); return ok(res,o);}
export async function updateStatus(req,res){const d=statusSchema.parse(req.body); const allowed=['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']; if(!allowed.includes(d.status))return fail(res,'Invalid status',422,'INVALID_STATUS'); const o=await Order.findByIdAndUpdate(req.params.id,{$set:{status:d.status},$push:{statusHistory:{status:d.status,changedBy:req.user._id}}},{new:true}); if(!o)return fail(res,'Order not found',404,'ORDER_NOT_FOUND'); await audit({actor:req.user._id,action:'STATUS_CHANGE',resource:'Order',resourceId:o.id,metadata:{status:d.status},requestId:req.id}); return ok(res,o);}
