import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { analysisRouter } from "./routers/analysis";
import { exportRouter } from "./routers/export";
import { integrationsRouter } from "./routers/integrations";
import { contentRouter } from "./routers/content";
import { knowledgeRouter } from "./routers/knowledge";
import { higgsfieldRouter } from "./routers/higgsfield";
import { facebookAdsRouter } from "./routers/facebookAds";
import { tokenRouter } from "./routers/token";
import { blotatoRouter } from "./routers/blotato";
import { pollinationsRouter } from "./routers/pollinations";
import { googleDriveRouter } from "./routers/googleDrive";
import { researchRouter } from "./routers/research";
import { pdfRouter } from "./routers/pdf";

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
  higgsfield: higgsfieldRouter,
  facebookAds: facebookAdsRouter,
  token: tokenRouter,
  blotato: blotatoRouter,
  pollinations: pollinationsRouter,
  googleDrive: googleDriveRouter,
  research: researchRouter,
  pdf: pdfRouter,
});

export type AppRouter = typeof appRouter;
