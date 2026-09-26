import {Product} from '../models/Product.js';
import {getPagination,paginationMeta} from '../utils/pagination.js';

export async function listProducts(query={}){
  const {page,limit,skip}=getPagination(query);
  const filter={active:true};
  if(query.category) filter.category=String(query.category);
  if(query.q) filter.$text={$search:String(query.q)};
  const projection={name:1,slug:1,category:1,description:1,image:1,specifications:1,stock:1,price:1,currency:1,active:1,createdAt:1,updatedAt:1};
  const started=process.hrtime.bigint();
  const rows=await Product.find(filter).select(projection).sort(query.sort==='name'?'name':{createdAt:-1}).skip(skip).limit(limit).lean().maxTimeMS(2500);
  const durationMs=Number(process.hrtime.bigint()-started)/1e6;
  if(String(query.meta).toLowerCase()==='false') return {items:rows,meta:{page,limit,hasNext:rows.length===limit,queryMs:Number(durationMs.toFixed(2))}};
  const total=await Product.countDocuments(filter).maxTimeMS(2500);
  return {items:rows,meta:{...paginationMeta({page,limit,total}),queryMs:Number(durationMs.toFixed(2))}};
}
