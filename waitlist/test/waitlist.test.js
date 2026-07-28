import assert from 'node:assert/strict'
import test from 'node:test'
import {
  formatFlooredPlus,
  validateWaitlistSignup,
  WAITLIST_ERRORS,
} from '../src/lib/waitlist.js'

test('formatFlooredPlus floors valid counts and safely handles invalid values', () => {
  assert.equal(formatFlooredPlus(103.9), '103+')
  assert.equal(formatFlooredPlus('42'), '42+')
  assert.equal(formatFlooredPlus(-1), '0+')
  assert.equal(formatFlooredPlus('not-a-number'), '0+')
})

test('validateWaitlistSignup normalizes a complete signup', () => {
  assert.deepEqual(
    validateWaitlistSignup({
      email: '  Shopper@Example.COM ',
      weeklySupermarket: '  Woolworths ',
      weeklySuburb: '  Ultimo ',
    }),
    {
      ok: true,
      value: {
        email: 'shopper@example.com',
        weeklySupermarket: 'Woolworths',
        weeklySuburb: 'Ultimo',
      },
    },
  )
})

test('validateWaitlistSignup rejects malformed email addresses', () => {
  assert.deepEqual(
    validateWaitlistSignup({
      email: 'missing-at.example.com',
      weeklySupermarket: 'Coles',
      weeklySuburb: 'Sydney',
    }),
    { ok: false, error: WAITLIST_ERRORS.invalidEmail },
  )
})

test('validateWaitlistSignup requires both shopping-location fields', () => {
  assert.deepEqual(
    validateWaitlistSignup({
      email: 'shopper@example.com',
      weeklySupermarket: 'Aldi',
      weeklySuburb: ' ',
    }),
    { ok: false, error: WAITLIST_ERRORS.locationRequired },
  )
})
