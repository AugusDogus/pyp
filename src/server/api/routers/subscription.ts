import { polarClient } from "~/lib/auth";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const subscriptionRouter = createTRPCRouter({
  getCustomerState: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get customer state directly by external ID (our user ID)
      const customerState = await polarClient.customers.getStateExternal({
        externalId: ctx.user.id,
      });

      return {
        hasActiveSubscription: customerState.activeSubscriptions.length > 0,
        activeSubscriptions: customerState.activeSubscriptions,
      };
    } catch (error) {
      // Customer not found or other error - treat as no subscription
      console.error("Failed to get customer state:", error);
      return {
        hasActiveSubscription: false,
        activeSubscriptions: [],
      };
    }
  }),
});
