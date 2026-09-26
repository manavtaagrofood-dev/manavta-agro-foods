import test from 'node:test';
import assert from 'node:assert/strict';
import { enquirySchema } from '../src/validators/schemas.js';
import { customerEmail, adminEmail } from '../src/services/notificationService.js';

test('sample request schema preserves the customer workflow fields', () => {
  const value = enquirySchema.parse({
    firstName: 'Asha', email: 'asha@example.com', requirementType: 'SAMPLE',
    productName: 'PR 114 Long Grain Parboiled Rice', quantity: '2 bags',
    packaging: '50 kg PP bags', destination: 'Ludhiana, Punjab',
    message: 'Please share a sample discussion for our buyer specification.',
  });
  assert.equal(value.requirementType, 'SAMPLE');
  assert.equal(value.destination, 'Ludhiana, Punjab');
  assert.equal(value.packaging, '50 kg PP bags');
});

test('transactional templates contain the reference and no marketing content', () => {
  const enquiry = { referenceId: 'ENQ-2026-TEST1234', firstName: 'Asha', lastName: 'Kaur', email: 'asha@example.com', productName: 'PR 114 Long Grain Parboiled Rice', requirementType: 'QUOTE', quantity: '20 MT', packaging: '50 kg PP bags', destination: 'Punjab', message: 'Need a quote.', status: 'NEW', createdAt: new Date() };
  const customer = customerEmail(enquiry);
  assert.match(customer.html, /ENQ-2026-TEST1234/);
  assert.match(customer.subject, /We Received Your Enquiry/);
  assert.doesNotMatch(customer.html.toLowerCase(), /newsletter|discount|promotion|offer/);
  assert.match(adminEmail(enquiry).subject, /ENQ-2026-TEST1234/);
});
