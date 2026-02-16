import { z } from "zod";

// API contract is simple since most logic will be client-side for a static generator.
// However, we can have an endpoint to log generation stats if needed in the future.

export const api = {
  // Placeholder for future backend expansion
  health: {
    check: {
      method: "GET" as const,
      path: "/api/health" as const,
      responses: {
        200: z.object({ status: z.string() }),
      },
    },
  },
};
