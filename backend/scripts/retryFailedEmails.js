import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Enquiry } from '../src/models/Enquiry.js';
import { sendCustomerEnquiryConfirmation, sendAdminNewEnquiryNotification } from '../src/services/notificationService.js';
await mongoose.connect(env.mongoUri);
try {
 const docs=await Enquiry.find({$or:[{customerEmailStatus:'failed'},{adminEmailStatus:'failed'}],notificationAttempts:{$lt:5}}).limit(100);
 for(const e of docs){let patch={notificationAttempts:(e.notificationAttempts||0)+1,lastNotificationAt:new Date()};
  if(e.customerEmailStatus==='failed'){try{await sendCustomerEnquiryConfirmation(e);patch.customerEmailStatus='sent';}catch{patch.customerEmailStatus='failed';}}
  if(e.adminEmailStatus==='failed'){try{await sendAdminNewEnquiryNotification(e);patch.adminEmailStatus='sent';}catch{patch.adminEmailStatus='failed';}}
  await Enquiry.updateOne({_id:e._id},{$set:patch});
 }
} finally {await mongoose.disconnect();}
