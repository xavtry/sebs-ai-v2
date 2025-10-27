const express = require("express");
const router = express.Router();
const { Configuration, OpenAIApi } = require("openai");

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn("Warning: OPENAI_API_KEY not set. Set it in .env to enable LLM calls.");
}
const configuration = new Configuration({ apiKey: OPENAI_KEY });
const openai = new OpenAIApi(configuration);

// Mode system (safe)
const MODE_PROMPTS = {
  Friendly: "You are Seb's AI, a helpful assistant. Keep answers friendly, concise and safe.",
  Developer: "You are Seb's AI in Developer Mode. Provide detailed, technical, and precise responses. Use code blocks where appropriate and explain decisions.",
  Creative: "You are Seb's AI in Creative Mode. Be imaginative, playful, and produce creative writing or ideas. Keep tone upbeat and family-friendly."
};

router.post("/", async (req, res) => {
  const { message, mode } = req.body || {};
  if (!message) return res.status(400).json({ error: "message required" });

  // Ensure mode is one of the allowed modes
  const chosenMode = ["Friendly", "Developer", "Creative"].includes(mode) ? mode : "Friendly";

  // Assemble system + user messages
  const systemPrompt = MODE_PROMPTS[chosenMode];
  const userPrompt = `User: ${message}`;

  try {
    if (!OPENAI_KEY) {
      // Dev fallback: simple echo with mode hint if API key not provided
      return res.json({ reply: `[local-mode] (${chosenMode}) You said: ${message}` });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini", // change to an available model like "gpt-4o-mini" or "gpt-4" depending on your access
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 700,
      temperature: chosenMode === "Creative" ? 0.9 : 0.2
    });

    const reply = completion.data.choices?.[0]?.message?.content?.trim() || "Sorry, no reply.";
    return res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "LLM error", details: err?.message || err });
  }
});

module.exports = router;

