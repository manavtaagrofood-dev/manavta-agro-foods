import {Product} from '../models/Product.js'; import {listProducts} from '../services/productService.js'; import {productSchema,createProductSchema} from '../validators/schemas.js'; import {ok,fail} from '../utils/api.js'; import {audit} from '../services/auditService.js';
const slugify=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
export async function list(req,res){
  const data=await listProducts(req.query);
  res.setHeader('Cache-Control', req.headers.authorization ? 'private, max-age=15' : 'public, max-age=30, stale-while-revalidate=120');
  if(data.meta?.queryMs!=null) res.setHeader('Server-Timing', `db;dur=${data.meta.queryMs}`);
  return ok(res,data);
}
export async function get(req,res){const p=await Product.findOne({_id:req.params.id,active:true}).lean(); if(!p)return fail(res,'Product not found',404,'PRODUCT_NOT_FOUND'); return ok(res,p);}
export async function create(req,res){const d=createProductSchema.parse(req.body); const p=await Product.create({...d,slug:slugify(d.name)}); await audit({actor:req.user._id,action:'PRODUCT_CREATED',resource:'Product',resourceId:p.id,requestId:req.id}); return ok(res,p,201);}
export async function update(req,res){const d=productSchema.partial().parse(req.body); if(d.name)d.slug=slugify(d.name); const p=await Product.findByIdAndUpdate(req.params.id,d,{new:true,runValidators:true}); if(!p)return fail(res,'Product not found',404,'PRODUCT_NOT_FOUND'); await audit({actor:req.user._id,action:'PRODUCT_UPDATED',resource:'Product',resourceId:p.id,requestId:req.id}); return ok(res,p);}
export async function remove(req,res){const p=await Product.findByIdAndUpdate(req.params.id,{active:false},{new:true}); if(!p)return fail(res,'Product not found',404,'PRODUCT_NOT_FOUND'); await audit({actor:req.user._id,action:'PRODUCT_DELETED',resource:'Product',resourceId:p.id,requestId:req.id}); return ok(res,p);}
