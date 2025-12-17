import fetch from "node-fetch"; // Vercel serverless supports fetch natively
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: false, message: "Method not allowed" });
  }

  const { email, amount, orderData } = req.body;

  if (!email || !amount || !orderData) {
    return res.status(400).json({ status: false, message: "Missing required fields" });
  }

  try {
    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects kobo
        currency: "NGN",
        metadata: { orderData },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ status: false, message: data.message || "Paystack initialization failed" });
    }

    // Return authorization_url to frontend
    return res.status(200).json(data);

  } catch (err) {
    console.error("Paystack initialize error:", err);
    return res.status(500).json({ status: false, message: "Server error initializing payment" });
  }
}
