import crypto from 'node:crypto';
import {RefreshToken} from '../models/RefreshToken.js';
import {signToken} from './jwt.js';
const refreshDays=Number(process.env.REFRESH_TOKEN_DAYS||7);
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
export async function issueSession(user){
  const refresh=crypto.randomBytes(48).toString('base64url');
  await RefreshToken.create({tokenHash:hash(refresh),user:user._id,expiresAt:new Date(Date.now()+refreshDays*86400000)});
  return {accessToken:signToken(user),refreshToken:refresh};
}
export async function rotateRefreshToken(raw){
  if(!raw) return null;
  const current=await RefreshToken.findOne({tokenHash:hash(raw),revokedAt:null,expiresAt:{$gt:new Date()}});
  if(!current) return null;
  const user=await (await import('../models/User.js')).User.findById(current.user).select('-passwordHash');
  if(!user||user.status!=='active') {current.revokedAt=new Date();await current.save();return null;}
  const next=await issueSession(user);
  const replacement=await RefreshToken.findOne({tokenHash:hash(next.refreshToken)}).select('_id');
  current.revokedAt=new Date(); current.replacedBy=replacement?._id; await current.save();
  return {user,accessToken:next.accessToken,refreshToken:next.refreshToken};
}
export async function revokeRefreshToken(raw){if(!raw)return false; const r=await RefreshToken.findOne({tokenHash:hash(raw),revokedAt:null}); if(!r)return false; r.revokedAt=new Date(); await r.save(); return true;}
export const REFRESH_COOKIE='ma_refresh';
export const refreshCookieOptions=()=>({httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/v1/auth',maxAge:refreshDays*86400000});
