import * as fs from "node:fs";
import * as path from "node:path";
import type { AGUIEvent } from "@aether/types";

export interface StoredEventRecord {
  id: string;
  taskId: string;
  eventType: string;
  payload: AGUIEvent;
  timestamp: number;
}

export interface IEventStore {
  append(taskId: string, event: AGUIEvent): Promise<StoredEventRecord>;
  getHistory(taskId: string): Promise<StoredEventRecord[]>;
  getAllEvents(): Promise<StoredEventRecord[]>;
  clear(): Promise<void>;
}

/**
 * High-performance, append-only sovereign event store with file persistence.
 * Zero external native compilation dependencies (safe on all platforms).
 */
export class PersistentEventStore implements IEventStore {
  private inMemoryCache: StoredEventRecord[] = [];
  private filePath: string | null = null;

  constructor(storagePath?: string) {
    if (storagePath) {
      this.filePath = storagePath;
      const dir = path.dirname(storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      this.loadFromFile();
    }
  }

  private loadFromFile(): void {
    if (!this.filePath || !fs.existsSync(this.filePath)) {
      return;
    }
    const lines = fs.readFileSync(this.filePath, "utf-8").split("\n");
    for (const line of lines) {
      if (line.trim()) {
        try {
          const record = JSON.parse(line) as StoredEventRecord;
          this.inMemoryCache.push(record);
        } catch {
          // ignore corrupted lines
        }
      }
    }
  }

  async append(taskId: string, event: AGUIEvent): Promise<StoredEventRecord> {
    const record: StoredEventRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      taskId,
      eventType: event.type,
      payload: event,
      timestamp: event.timestamp || Date.now()
    };

    this.inMemoryCache.push(record);

    if (this.filePath) {
      fs.appendFileSync(this.filePath, JSON.stringify(record) + "\n", "utf-8");
    }

    return record;
  }

  async getHistory(taskId: string): Promise<StoredEventRecord[]> {
    return this.inMemoryCache.filter((r) => r.taskId === taskId);
  }

  async getAllEvents(): Promise<StoredEventRecord[]> {
    return [...this.inMemoryCache];
  }

  async clear(): Promise<void> {
    this.inMemoryCache = [];
    if (this.filePath && fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }
}
