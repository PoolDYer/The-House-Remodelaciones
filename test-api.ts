import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_change_in_production";

function generateTestToken() {
  const payload = {
    adminId: "cm8cncw0k0002mk4k2n2g01i2", 
    email: "jeanpool@gmail.com",
    role: "admin",
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function run() {
  const token = generateTestToken();
  const res = await fetch("http://localhost:3000/api/publicaciones");
  const data = await res.json();
  const pubs = data.publicaciones || [];
  if (pubs.length > 0) {
    const pubId = pubs[0].id;
    console.log("Attempting to delete:", pubId);
    const deleteRes = await fetch(`http://localhost:3000/api/publicaciones/${pubId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Status:", deleteRes.status);
    const result = await deleteRes.json();
    console.log("Response:", result);
  } else {
    console.log("No publications found.");
  }
}

run();
