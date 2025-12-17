export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, amount, orderData } = req.body;

  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount: amount * 100,
          currency: "NGN",
          metadata: orderData
        })
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ status: false });
  }
}
