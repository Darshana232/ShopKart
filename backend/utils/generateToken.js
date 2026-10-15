// backend/utils/generateToken.js
//
// WHAT:  A utility that creates a JWT and sets it as an HttpOnly cookie on the response.
// WHY:   Both register AND login need to issue a token. Putting this in one place
//        follows the DRY principle (Don't Repeat Yourself).
//
// HOW JWT works:
//   jwt.sign({ id }, secret, options)
//   → Produces a 3-part base64 string: header.payload.signature
//   → The signature proves the server created it (only the server knows the secret)
//   → Anyone can READ the payload (it's not encrypted!) — never put passwords in JWT
//
// WHY HttpOnly cookie over localStorage?
//   localStorage is accessible by ANY JavaScript on the page.
//   If an attacker injects malicious JS (XSS attack), they steal the token.
//   HttpOnly cookies are invisible to JavaScript — browser sends them automatically.

import jwt from "jsonwebtoken";

const generateToken = (res, customerId) => {
  // Sign the token with the customer's MongoDB _id as payload
  const token = jwt.sign(
    { id: customerId },           // Payload — what's "inside" the token
    process.env.JWT_SECRET,       // Secret key — used to create + verify signatures
    { expiresIn: "7d" }           // Token is valid for 7 days
  );

  // Set the token as an HttpOnly cookie
  res.cookie("shopkart_token", token, {
    httpOnly: true,               // Cannot be read by document.cookie (JS)
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",           // Only sent to same origin (CSRF protection)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

export default generateToken;
