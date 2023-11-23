import Cors from "cors";
import { runMiddleware } from "@/utils/cors"; // create a file named cors.js in the utils folder with the provided code below
const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");
const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.API_KEY;
const handler = async (req, res) => {
  await runMiddleware(req, res, Cors());
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed!" });
  } else {
    const { jobDescription, resume } = req.body;
    if (jobDescription !== undefined && resume !== undefined) {
      try {
        const client = new TextServiceClient({
          authClient: new GoogleAuth().fromAPIKey(API_KEY),
        });
        const promptString = `Input:
      1. Job Description: ${jobDescription}
      2. User Resume : ${resume}
      Instructions:
      1. Assume you are a software designed to help me build professional resumes.
      2. Check if the provided paragraph is a valid job description.
      3. If it is not a valid job description, respond with a message indicating that.
      4. If it is a valid job description, suggest how can I improve my existing resume to match this job description. Strictly align to the users given details and do not invent any information on your own.
      `;
        const stopSequences = [];
        const result = await client
          .generateText({
            // required, which model to use to generate the result
            model: MODEL_NAME,
            // optional, 0.0 always uses the highest-probability result
            temperature: 0.7,
            // optional, how many candidate results to generate
            candidateCount: 1,
            // optional, number of most probable tokens to consider for generation
            top_k: 40,
            // optional, for nucleus sampling decoding strategy
            top_p: 0.95,
            // optional, maximum number of output tokens to generate
            max_output_tokens: 1024,
            // optional, sequences at which to stop model generation
            stop_sequences: stopSequences,
            // optional, safety settings
            safety_settings: [
              { category: "HARM_CATEGORY_DEROGATORY", threshold: 1 },
              { category: "HARM_CATEGORY_TOXICITY", threshold: 1 },
              { category: "HARM_CATEGORY_VIOLENCE", threshold: 2 },
              { category: "HARM_CATEGORY_SEXUAL", threshold: 2 },
              { category: "HARM_CATEGORY_MEDICAL", threshold: 2 },
              { category: "HARM_CATEGORY_DANGEROUS", threshold: 2 },
            ],
            prompt: {
              text: promptString,
            },
          })
          .then((result) => {
            res
              .status(200)
              .send(JSON.stringify(result[0].candidates[0].output, null, 2));
          });
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
