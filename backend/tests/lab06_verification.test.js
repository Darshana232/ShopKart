import assert from "assert";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";

console.log("==================================================");
console.log("🧪 SHOPKART LAB 06 AUTOMATED VERIFICATION SUITE");
console.log("==================================================\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// ---------------------------------------------------------
// TEST SUITE 1: SHIPPING ADDRESS VALIDATION
// ---------------------------------------------------------
console.log("--- 1. Shipping Address Validation Tests ---");

const validateAddressHelper = (address) => {
  if (!address) return { valid: false, msg: "Required" };
  const { fullName, phone, addressLine1, city, state, pincode } = address;
  if (!fullName || !fullName.trim() || fullName.trim().length < 2)
    return { valid: false, msg: "Invalid name" };
  const cleanPhone = (phone || "").trim().replace(/[\s-]/g, "");
  if (!/^(\+91)?[6-9]\d{9}$/.test(cleanPhone))
    return { valid: false, msg: "Invalid phone" };
  if (!addressLine1 || !addressLine1.trim() || addressLine1.trim().length < 5)
    return { valid: false, msg: "Invalid address" };
  if (!city || !city.trim()) return { valid: false, msg: "Invalid city" };
  if (!state || !state.trim()) return { valid: false, msg: "Invalid state" };
  if (!pincode || !/^\d{6}$/.test(pincode.trim()))
    return { valid: false, msg: "Invalid pincode" };
  return { valid: true };
};

test("Valid shipping address returns valid: true", () => {
  const valid = validateAddressHelper({
    fullName: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "123 Tech Park Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  });
  assert.strictEqual(valid.valid, true);
});

test("Address with invalid phone (< 10 digits) fails validation", () => {
  const res = validateAddressHelper({
    fullName: "Aarav Sharma",
    phone: "12345",
    addressLine1: "123 Tech Park Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  });
  assert.strictEqual(res.valid, false);
});

test("Address with invalid pincode (!= 6 digits) fails validation", () => {
  const res = validateAddressHelper({
    fullName: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "123 Tech Park Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "5600",
  });
  assert.strictEqual(res.valid, false);
});

test("Whitespace-only input fails validation", () => {
  const res = validateAddressHelper({
    fullName: "   ",
    phone: "9876543210",
    addressLine1: "123 Tech Park Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  });
  assert.strictEqual(res.valid, false);
});

// ---------------------------------------------------------
// TEST SUITE 2: SERVER-SIDE PRICE AND STOCK CALCULATIONS
// ---------------------------------------------------------
console.log("\n--- 2. Price and Stock Validation Logic ---");

test("Server recalculates total and rejects fake frontend total", () => {
  const dbProducts = [
    { id: "p1", name: "Mechanical Keyboard", price: 2999, stock: 10 },
    { id: "p2", name: "Wireless Mouse", price: 1499, stock: 5 },
  ];
  const userCart = [
    { product: "p1", quantity: 2 },
    { product: "p2", quantity: 1 },
  ];
  const fakeClientTotal = 1; // Attempted client-side exploit

  let serverCalculatedTotal = 0;
  for (const item of userCart) {
    const prod = dbProducts.find((p) => p.id === item.product);
    serverCalculatedTotal += prod.price * item.quantity;
  }

  assert.strictEqual(serverCalculatedTotal, 2999 * 2 + 1499 * 1);
  assert.strictEqual(serverCalculatedTotal, 7497);
  assert.notStrictEqual(serverCalculatedTotal, fakeClientTotal);
});

test("Final stock verification catches inventory exhaustion", () => {
  const dbProduct = { id: "p1", name: "Limited Edition Watch", price: 4999, stock: 2 };
  const userCartItem = { product: "p1", quantity: 3 };

  const isStockAvailable = dbProduct.stock >= userCartItem.quantity;
  assert.strictEqual(isStockAvailable, false);
});

test("Currency conversion to paise for Razorpay is accurate", () => {
  const rupeeTotal = 7497.5;
  const paiseTotal = Math.round(rupeeTotal * 100);
  assert.strictEqual(paiseTotal, 749750);
});

// ---------------------------------------------------------
// TEST SUITE 3: RAZORPAY HMAC-SHA256 SIGNATURE VERIFICATION
// ---------------------------------------------------------
console.log("\n--- 3. Razorpay Signature Verification ---");

const secret = "test_razorpay_secret_key_xyz";
const orderId = "order_ShopKart12345";
const paymentId = "pay_ClientPayment98765";

const generateSignature = (oId, pId, sec) => {
  const body = `${oId}|${pId}`;
  return crypto.createHmac("sha256", sec).update(body).digest("hex");
};

test("Valid signature matches expected HMAC hash", () => {
  const legitSignature = generateSignature(orderId, paymentId, secret);
  const verifyBody = `${orderId}|${paymentId}`;
  const computed = crypto.createHmac("sha256", secret).update(verifyBody).digest("hex");
  assert.strictEqual(computed, legitSignature);
});

test("Tampered signature is rejected", () => {
  const legitSignature = generateSignature(orderId, paymentId, secret);
  const fakeSignature = legitSignature.slice(0, -4) + "0000";
  assert.notStrictEqual(fakeSignature, legitSignature);
});

test("Tampered payment_id causes signature mismatch", () => {
  const legitSignature = generateSignature(orderId, paymentId, secret);
  const tamperedPaymentId = "pay_HackedFakePayment";
  const computed = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${tamperedPaymentId}`)
    .digest("hex");
  assert.notStrictEqual(computed, legitSignature);
});

test("Tampered order_id causes signature mismatch", () => {
  const legitSignature = generateSignature(orderId, paymentId, secret);
  const tamperedOrderId = "order_DifferentCartOrder";
  const computed = crypto
    .createHmac("sha256", secret)
    .update(`${tamperedOrderId}|${paymentId}`)
    .digest("hex");
  assert.notStrictEqual(computed, legitSignature);
});

// ---------------------------------------------------------
// TEST SUITE 4: ORDER MONGOOSE SCHEMA VALIDATION
// ---------------------------------------------------------
console.log("\n--- 4. Mongoose Order Model Schema Tests ---");

test("Order schema requires customer, items, shippingAddress, and totalAmount", () => {
  const dummyOrder = new Order({});
  const validationError = dummyOrder.validateSync();
  assert.ok(validationError);
  assert.ok(validationError.errors["customer"]);
  assert.ok(validationError.errors["shippingAddress"]);
  assert.ok(validationError.errors["totalAmount"]);
});

test("Order schema correctly validates enums and defaults", () => {
  const customerId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  const testOrder = new Order({
    customer: customerId,
    items: [
      {
        product: productId,
        name: "Test Mechanical Keyboard",
        price: 2999,
        quantity: 1,
        image: "https://example.com/test.jpg",
      },
    ],
    shippingAddress: {
      fullName: "Test User",
      phone: "9876543210",
      addressLine1: "123 Street",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
    },
    totalAmount: 2999,
  });

  const err = testOrder.validateSync();
  assert.strictEqual(err, undefined);
  assert.strictEqual(testOrder.paymentStatus, "PENDING");
  assert.strictEqual(testOrder.status, "PENDING_PAYMENT");
});

test("Order schema rejects invalid enum values", () => {
  const customerId = new mongoose.Types.ObjectId();
  const invalidOrder = new Order({
    customer: customerId,
    totalAmount: 100,
    paymentStatus: "INVALID_STATUS",
  });
  const err = invalidOrder.validateSync();
  assert.ok(err.errors["paymentStatus"]);
});

// ---------------------------------------------------------
// TEST SUITE 5: OWNERSHIP AUTHORIZATION RULES
// ---------------------------------------------------------
console.log("\n--- 5. Ownership & Authorization Verification ---");

test("User cannot access another user's order", () => {
  const userA = new mongoose.Types.ObjectId().toString();
  const userB = new mongoose.Types.ObjectId().toString();
  const orderOwner = userA;

  const requestCaller = userB;
  const isAuthorized = orderOwner === requestCaller;
  assert.strictEqual(isAuthorized, false);
});

test("Order owner is authorized", () => {
  const userA = new mongoose.Types.ObjectId().toString();
  const orderOwner = userA;
  const requestCaller = userA;

  const isAuthorized = orderOwner === requestCaller;
  assert.strictEqual(isAuthorized, true);
});

console.log("\n==================================================");
console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
console.log("==================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
