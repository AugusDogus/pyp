import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { polarClient } from "~/lib/auth";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { savedSearch } from "~/schema";

export const filtersSchema = z.object({
  makes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  salvageYards: z.array(z.string()).optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  sortBy: z.string().optional(),
});

export const savedSearchesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const searches = await ctx.db
      .select()
      .from(savedSearch)
      .where(eq(savedSearch.userId, ctx.user.id))
      .orderBy(savedSearch.createdAt);

    return searches.map((s) => ({
      ...s,
      filters: JSON.parse(s.filters) as z.infer<typeof filtersSchema>,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        query: z.string(),
        filters: filtersSchema,
        emailAlertsEnabled: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const id = crypto.randomUUID();
      const now = new Date();

      await ctx.db.insert(savedSearch).values({
        id,
        userId: ctx.user.id,
        name: input.name,
        query: input.query,
        filters: JSON.stringify(input.filters),
        emailAlertsEnabled: input.emailAlertsEnabled ?? false,
        createdAt: now,
        updatedAt: now,
      });

      return { id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(savedSearch)
        .where(
          and(
            eq(savedSearch.id, input.id),
            eq(savedSearch.userId, ctx.user.id),
          ),
        );

      return { success: true };
    }),

  toggleEmailAlerts: protectedProcedure
    .input(z.object({ id: z.string(), enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // If enabling alerts, verify user has an active subscription
      if (input.enabled) {
        try {
          const customerState = await polarClient.customers.getStateExternal({
            externalId: ctx.user.id,
          });
          if (customerState.activeSubscriptions.length === 0) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "An active subscription is required to enable email alerts",
            });
          }
        } catch (error) {
          // If it's already a TRPCError, rethrow it
          if (error instanceof TRPCError) {
            throw error;
          }
          // Otherwise, treat as no subscription (customer not found, etc.)
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "An active subscription is required to enable email alerts",
          });
        }
      }

      await ctx.db
        .update(savedSearch)
        .set({ emailAlertsEnabled: input.enabled })
        .where(
          and(
            eq(savedSearch.id, input.id),
            eq(savedSearch.userId, ctx.user.id),
          ),
        );

      return { success: true };
    }),
});
