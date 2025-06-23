import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";

export function setupWorker() {
  const worker = new Worker(
    "example-queue",
    async (job) => {
      console.log("Processing job:", job.id, job.data);
      // Perform async task here...
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job) => {
    const userId = job.data.userId;
    const socketId = socketRegistry.getSocketId(userId);
    // if (socketId) {
    //   ioInstance.to(socketId).emit("job:completed", {
    //     jobId: job.id,
    //     message: "Job completed successfully",
    //   });
    // }
  });

  worker.on("failed", (job, err) => {
    const userId = job?.data?.userId;
    const socketId = socketRegistry.getSocketId(userId);
    // if (socketId) {
    //   ioInstance.to(socketId).emit("job:failed", {
    //     jobId: job?.id,
    //     error: err.message,
    //   });
    // }
  });
}
