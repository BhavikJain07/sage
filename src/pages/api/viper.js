import multer from "multer";
import { runMiddleware } from "@/utils/cors"; // Adjust path

const upload = multer({
  // Define storage and file limits
  dest: "uploads/",
  limits: { fileSize: 1000000 }, // 1MB limit
  debug: true,
});

const uploadMiddleware = upload.single("file");

export default async function handler(req, res) {
  await runMiddleware(req, res, async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      await uploadMiddleware(req, res, async (error) => {
        if (error) {
          return res
            .status(400)
            .json({ error: "File upload error", message: error });
        }

        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Perform further file processing (optional)

        return res.status(200).json({ filename: req.file.filename });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
