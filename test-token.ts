import jwt from 'jsonwebtoken';

// Using the same secret as auth
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

function generateTestToken() {
  const payload = {
    adminId: "cm8cncdz900013mk4kcxn9g9r", // Fake ID or whatever
    email: "jeanpool@gmail.com",
    role: "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

console.log(generateTestToken());
