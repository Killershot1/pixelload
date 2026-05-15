const Groq = require('groq-sdk');

// Initialize Groq client
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * POST /v1/search
 * Intelligent search across video metadata
 */
exports.search = async (req, res, next) => {
  try {
    const { query, clientId } = req.body;

    if (!groq) {
      return res.status(200).json({
        success: true,
        query,
        results: [
          {
            title: `Mock result for: ${query}`,
            channel: "Visionco AI",
            aiReason: "Groq API key not configured. This is a fallback response."
          }
        ],
        source: "Visionco AI (Fallback)"
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a video search assistant. Given a query, return a JSON array of mock video results that match the user's intent. Include title, channel, and a brief 'aiReason' for each."
        },
        { role: "user", content: query }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      query,
      results: aiResponse.results || [],
      source: "Visionco AI"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/summarize
 * Generates AI summaries for video content
 */
exports.summarize = async (req, res, next) => {
  try {
    const { url, clientId } = req.body;

    if (!groq) {
      return res.status(200).json({
        success: true,
        url,
        summary: "Groq API key not configured. Unable to generate real summary.",
        keyPoints: ["Point 1", "Point 2"],
        sentiment: "neutral",
        topics: ["General"],
        confidence: 0.5
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a video summarizer. Provide a summary, keyPoints array, sentiment, and topics for the given video URL. Return as a JSON object."
        },
        { role: "user", content: `Summarize this video: ${url}` }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    const summary = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      url,
      ...summary,
      confidence: 0.95
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /v1/recommend
 * Personalized video recommendations
 */
exports.recommend = async (req, res, next) => {
  try {
    const { clientId, watchHistory } = req.body;

    if (!groq) {
      return res.status(200).json({
        success: true,
        clientId,
        recommendations: [
          {
            title: "Recommended Video",
            aiReason: "Groq API key not configured. This is a fallback recommendation."
          }
        ]
      });
    }

    const historyStr = (watchHistory || []).join(', ');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a recommendation engine. Based on the watch history, suggest 3 similar videos. Return as a JSON array named 'recommendations' with title and 'aiReason'."
        },
        { role: "user", content: `My watch history: ${historyStr}` }
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" }
    });

    const recommendations = JSON.parse(completion.choices[0].message.content);

    res.status(200).json({
      success: true,
      clientId,
      recommendations: recommendations.recommendations || []
    });
  } catch (error) {
    next(error);
  }
};
