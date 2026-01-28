import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  originalFilename: text("original_filename").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  videoUrls: text("video_urls").array(), // List of generated video URLs
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  audioUrl: text("audio_url"), // For AI voice response
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobs).omit({ 
  id: true, 
  createdAt: true,
  status: true,
  videoUrls: true 
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface CreateJobResponse {
  jobId: number;
  status: JobStatus;
}
