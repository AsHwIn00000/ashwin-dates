const Groq = require('groq-sdk');

// Initialize Groq using environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are AshwinBot, a friendly and helpful assistant for "Ashwin Dates and Dry Fruits" - a premium dry fruits, dates, spices, seeds and flavoured essence store.

You help customers with:
- Product information (dates, dry fruits, spices, combo packs, seeds, flavoured essence)
- Health benefits of dates and dry fruits
- Order tracking guidance
- Shipping and delivery queries
- Payment methods (Razorpay online & Cash on Delivery)
- Return/refund policies
- Nutritional information
- Recipe suggestions using dry fruits and dates
- Pricing and discount queries

Store policies:
- Free shipping on orders above ₹500
- COD available for all orders
- 7-day return policy for damaged products
- Delivery in 3-5 business days
- Contact: +91 9442114559 | preamkumar.t.m1978@gmail.com

Be concise, friendly, and helpful. Always recommend products when relevant. If asked about specific order details, ask them to check their order history in the account section.`;

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ message: 'Messages array required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // keep last 10 messages for context
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not process that.';
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: 'Chatbot error: ' + err.message });
  }
};
