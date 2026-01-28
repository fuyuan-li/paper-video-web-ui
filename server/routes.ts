import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.jobs.upload.path, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const job = await storage.createJob({
        originalFilename: req.file.originalname,
        pdfUrl: "mock_stored_path/" + req.file.originalname,
        status: "processing",
        videoUrls: [],
      });

      setTimeout(async () => {
        try {
          await storage.updateJob(job.id, {
            status: "completed",
            videoUrls: [
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
            ]
          });
        } catch (err) {
          console.error(`Error processing job ${job.id}:`, err);
          await storage.updateJob(job.id, { status: "failed" });
        }
      }, 5000);

      res.status(201).json(job);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid job ID" });
    const job = await storage.getJob(id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  });

  // Chat Routes
  app.get(api.chat.list.path, async (req, res) => {
    const msgs = await storage.getMessages();
    res.json(msgs);
  });

  app.post(api.chat.send.path, async (req, res) => {
    try {
      const input = api.chat.send.input.parse(req.body);
      const userMsg = await storage.createMessage(input);
      
      // Mock AI response
      setTimeout(async () => {
        await storage.createMessage({
          role: "assistant",
          content: `I received your message: "${input.content}". This is a mock AI response with voice support.`,
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Mock audio
        });
      }, 1000);

      res.status(201).json(userMsg);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}
