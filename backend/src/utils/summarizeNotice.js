// ============================================================
// AI SUMMARIZATION UTILITY (OpenRouter API)
// ============================================================
// Sends notice content to an LLM via OpenRouter and returns a short
// summary. Kept as a separate utility (not inline in the controller)
// so this API-calling logic is reusable and isolated — easier to
// test, swap providers later, or mock in automated tests.

// Node 18+ has fetch built in globally, so no extra HTTP package needed.

const summarizeNotice = async (noticeContent) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        // Free-tier-friendly model — swap this for any model OpenRouter supports.
       model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "user",
            // WHY a structured, explicit prompt instead of just "summarize this"?
            // Being specific about length AND what to preserve (dates/deadlines
            // matter most for students) gives more consistently useful output
            // than an open-ended instruction.
            content: `Summarize the following college notice in 2-3 short sentences. Keep any dates, deadlines, or action items intact. Notice: "${noticeContent}"`,
          },
        ],
      }),
    });

    const data = await response.json();

    // Defensive check: if OpenRouter returns an unexpected shape
    // (rate limited, model error, etc.), don't crash — just signal
    // "no summary available" back to the caller.
    if (!data.choices || !data.choices[0]) {
      console.error("OpenRouter returned unexpected response:", data);
      return null;
    }

    return data.choices[0].message.content.trim();
  } catch (error) {
    // Network failure, timeout, invalid API key, etc.
    // We deliberately return null instead of throwing — the calling
    // controller decides that a failed summary should NOT block the
    // notice from being saved. This is what "graceful degradation" means.
    console.error("OpenRouter API call failed:", error.message);
    return null;
  }
};

module.exports = summarizeNotice;