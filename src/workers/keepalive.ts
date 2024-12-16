import { ScheduledEvent, ExecutionContext } from "@cloudflare/workers-types";

export interface Env {
  // If you need any environment variables, declare them here
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    try {
      const response = await fetch("https://flymebaby-python.onrender.com");
      if (response.ok) {
        console.log("Successfully pinged backend server");
      } else {
        console.error(`Failed to ping backend: ${response.status}`);
      }
    } catch (error) {
      console.error("Error pinging backend:", error);
    }
  },
};
