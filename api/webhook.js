import admin from "firebase-admin";
import crypto from "crypto";

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

  // Paystack webhook signature
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (req.headers["x-paystack-signature"] !== hash) {
    console.error("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;

  // Only process successful transactions
  if (event.event === "charge.success") {
    try {
      const metadata = event.data.metadata.orderData; // Customer info + cart
      const reference = event.data.reference;
      const totalAmount = event.data.amount / 100; // Convert kobo to Naira

      await db.collection("orders").add({
        Timestamp: new Date().toLocaleString(),
        "First Name": metadata.customer.fname,
        "Last Name": metadata.customer.lname,
        Email: metadata.customer.email,
        Phone: metadata.customer.phone,
        Country: metadata.customer.country,
        Address: metadata.customer.address,
        State: metadata.customer.state,
        City: metadata.customer.city,
        "Additional Info": metadata.customer.additional || "",
        "Cart Details": JSON.stringify(metadata.cart),
        Total: totalAmount,
        "Payment Reference": reference,
        Paid: true,
      });

      console.log("Order saved:", reference);
      return res.status(200).send("Webhook received");

    } catch (err) {
      console.error("Error saving order:", err);
      return res.status(500).send("Server error");
    }
  }

  // If event is not charge.success, ignore
  return res.status(200).send("Event ignored");
}
