import { nanoid } from 'nanoid';
import { Job, JobEvent, GeneratedOutput } from '../skills/types';

type JobListener = (event: JobEvent) => void;

class JobStore {
  private jobs = new Map<string, Job>();
  private listeners = new Map<string, Set<JobListener>>();

  createJob(skillId: string): string {
    const id = nanoid();
    const job: Job = {
      id,
      skillId,
      status: 'pending',
      events: [],
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return id;
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  addEvent(jobId: string, event: JobEvent): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const eventWithJobId = { ...event, jobId };
    job.events.push(eventWithJobId);

    if (job.status === 'pending') {
      job.status = 'running';
    }

    // Notify listeners
    const jobListeners = this.listeners.get(jobId);
    if (jobListeners) {
      for (const listener of jobListeners) {
        try {
          listener(eventWithJobId);
        } catch {
          // Listener threw — remove it silently
          jobListeners.delete(listener);
        }
      }
    }
  }

  completeJob(jobId: string, output: GeneratedOutput): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = 'complete';
    job.output = output;
  }

  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = 'error';
    job.error = error;
  }

  /**
   * Subscribe to a job's events. Returns a ReadableStream suitable for SSE.
   * Replays all existing events before streaming new ones.
   */
  subscribe(jobId: string): ReadableStream<string> {
    const job = this.jobs.get(jobId);

    if (!job) {
      return new ReadableStream<string>({
        start(controller) {
          controller.enqueue(`data: ${JSON.stringify({ type: 'error', message: 'Job not found' })}\n\n`);
          controller.close();
        },
      });
    }

    let listener: JobListener | null = null;

    return new ReadableStream<string>({
      start: (controller) => {
        // Replay existing events
        for (const event of job.events) {
          controller.enqueue(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
        }

        // If job is already terminal, close immediately
        if (job.status === 'complete' || job.status === 'error') {
          controller.close();
          return;
        }

        // Listen for new events
        listener = (event: JobEvent) => {
          try {
            controller.enqueue(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
            if (event.type === 'complete' || event.type === 'error') {
              controller.close();
              this.removeListener(jobId, listener!);
            }
          } catch {
            // Stream was closed by client
            this.removeListener(jobId, listener!);
          }
        };

        this.addListener(jobId, listener);
      },
      cancel: () => {
        if (listener) {
          this.removeListener(jobId, listener);
        }
      },
    });
  }

  private addListener(jobId: string, listener: JobListener): void {
    if (!this.listeners.has(jobId)) {
      this.listeners.set(jobId, new Set());
    }
    this.listeners.get(jobId)!.add(listener);
  }

  private removeListener(jobId: string, listener: JobListener): void {
    const jobListeners = this.listeners.get(jobId);
    if (jobListeners) {
      jobListeners.delete(listener);
      if (jobListeners.size === 0) {
        this.listeners.delete(jobId);
      }
    }
  }
}

// Singleton instance — use globalThis to survive Next.js module reloads
const globalForJobStore = globalThis as unknown as { __jobStore?: JobStore };

if (!globalForJobStore.__jobStore) {
  globalForJobStore.__jobStore = new JobStore();
}

export const jobStore = globalForJobStore.__jobStore;
