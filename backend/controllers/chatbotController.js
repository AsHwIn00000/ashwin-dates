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

const getFallbackReply = (userQuery) => {
  const query = (userQuery || '').toLowerCase();
  
  if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
    return "Hi! 👋 Welcome to Ashwin Dates & Dry Fruits! How can I help you today? You can ask about our Medjool dates, almonds, cashews, order tracking, shipping, or discounts!";
  }
  if (query.includes('date') || query.includes('ajwa') || query.includes('medjool')) {
    return "🌴 We offer premium Medjool Dates and Madinah Ajwa Dates! They are rich in natural iron, fiber, and essential minerals. Check out our 'Dates' category for details and weight options.";
  }
  if (query.includes('ship') || query.includes('deliver') || query.includes('charge')) {
    return "🚚 Shipping is ₹90 per kg across India. Orders are processed swiftly and delivered within 3-5 business days!";
  }
  if (query.includes('order') || query.includes('track')) {
    return "📦 You can view and track all your previous purchases by clicking 'My Orders' in the top menu!";
  }
  if (query.includes('pay') || query.includes('cod') || query.includes('cash')) {
    return "💳 We accept online payments via Razorpay (UPI, Credit/Debit cards, Netbanking) and offer Cash on Delivery (COD) as well!";
  }
  if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('call')) {
    return "📞 Contact Us:\nPhone: +91 9442114559\nEmail: ashwindatesanddryfruits@gmail.com";
  }
  if (query.includes('almond') || query.includes('cashew') || query.includes('pista') || query.includes('dry fruit')) {
    return "🥜 We offer California Almonds, Whole W240 Cashews, Iranian Pistachios, and Combo Packs! All our dry fruits are fresh and nutrient-dense.";
  }
  
  return "Welcome to Ashwin Dates & Dry Fruits! 🌴 We provide top quality Medjool & Ajwa dates, almonds, cashews, spices, and seeds. How can I assist you with your order or product details today?";
};

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: 'Messages array required' });
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

    try {
      const completion = await groq.chat.completions.create({
        model: process.env.CHATBOT_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content || getFallbackReply(lastUserMessage);
      res.json({ reply });
    } catch (apiErr) {
      console.warn('Groq API fallback triggered:', apiErr.message);
      const reply = getFallbackReply(lastUserMessage);
      res.json({ reply });
    }
  } catch (err) {
    console.error('Chatbot route error:', err);
    res.json({ reply: "Hi! Welcome to Ashwin Dates & Dry Fruits! How can I assist you with our dates, dry fruits, or orders today?" });
  }
};
