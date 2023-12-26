import Cors from "cors";
import { runMiddleware } from "@/utils/cors"; // create a file named cors.js in the utils folder with the provided code below
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;
const handler = async (req, res) => {
  await runMiddleware(req, res, Cors());
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed!" });
  } else {
    const { jobDescription } = req.body;
    if (jobDescription !== undefined) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const generationConfig = {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        };

        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ];

        const parts = [
          {
            text: `Input:\nJob Description - A job description pasted by the user.\nTask: \nAnalyze a job description Check if its a job description. If not, respond with a message saying its not a valid job description. If it is provide detailed, data-driven recommendations for tailoring an existing resume to that specific job like give the keywords or the keyphrases to  add or on what all sections or details is necessary for the resume. Make it more natural like a conversation. \nJob Description: ${jobDescription}\n`,
          },
        ];
        const result = await model.generateContent({
          contents: [{ role: "user", parts }],
          generationConfig,
          safetySettings,
        });
        const response = result.response;
        res.status(200).json({ result: response.text() });
      } catch (error) {
        res.status(500).json({
          status: "Internal Server Error!",
          error: error,
        });
      }
    } else {
      res.status(400).json({ error: "BAD REQUEST- Missing values" });
    }
  }
};
export default handler;
