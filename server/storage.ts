import { jobs, type Job, type InsertJob, messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  updateJob(id: number, updates: Partial<Job>): Promise<Job>;
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(insertJob).returning();
    return job;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async updateJob(id: number, updates: Partial<Job>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set(updates)
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(asc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
