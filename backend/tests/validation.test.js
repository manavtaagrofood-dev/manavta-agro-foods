import test from 'node:test'; import assert from 'node:assert/strict'; import {registerSchema,enquirySchema,productSchema} from '../src/validators/schemas.js';
test('registration rejects weak passwords',()=>assert.throws(()=>registerSchema.parse({name:'A',email:'a@b.com',password:'123'})));
test('enquiry accepts required business fields',()=>{const v=enquirySchema.parse({firstName:'John',lastName:'Smith',email:'john@example.com',phone:'+123456789',country:'UK',quantity:'10 MT',message:'Need a quotation for rice.'}); assert.equal(v.country,'UK');});
test('product requires a meaningful description',()=>assert.throws(()=>productSchema.parse({name:'Rice',category:'basmati',description:'x'})));
