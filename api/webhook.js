import crypto from "crypto";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  const signature = req.headers["x-paystack-signature"];

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) return res.status(401).end();

  if (req.body.event === "charge.success") {
    const data = req.body.data;

    await db.collection("orders").add({
      email: data.customer.email,
      amount: data.amount / 100,
      reference: data.reference,
      metadata: data.metadata,
      paid: true,
      createdAt: new Date()
    });
  }

  res.status(200).end();
}
