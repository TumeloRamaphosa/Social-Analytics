import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { analysisRouter } from "./routers/analysis";
import { exportRouter } from "./routers/export";
import { integrationsRouter } from "./routers/integrations";
import { contentRouter } from "./routers/content";
import { knowledgeRouter } from "./routers/knowledge";
import { facebookRouter } from "./routers/facebook";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  analysis: analysisRouter,
  export: exportRouter,
  integrations: integrationsRouter,
  content: contentRouter,
  knowledge: knowledgeRouter,
  facebook: facebookRouter,
});

export type AppRouter = typeof appRouter;
