import { AuditLog } from '../models/AuditLog.js';
export async function audit({actor,action,resource,resourceId,metadata={},requestId}) {
  try { await AuditLog.create({actor,action,resource,resourceId,metadata,requestId}); } catch (e) { console.error(JSON.stringify({level:'warn',message:'audit_write_failed',error:e.message,requestId})); }
}
