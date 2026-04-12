import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";

let puppeteer: any = null;

async function getPuppeteer() {
  if (!puppeteer) {
    try {
      puppeteer = await import("puppeteer");
    } catch (e) {
      console.error("[PDF] Puppeteer not available:", e);
      return null;
    }
  }
  return puppeteer;
}

export const pdfRouter = router({
  // Generate PDF from HTML
  generatePdf: protectedProcedure
    .input(z.object({
      html: z.string(),
      options: z.object({
        format: z.enum(["a4", "letter", "html"]).default("a4"),
        landscape: z.boolean().default(false),
        printBackground: z.boolean().default(true),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const pup = await getPuppeteer();
      if (!pup) {
        throw new Error("Puppeteer not installed. Run: pnpm add puppeteer");
      }

      const browser = await pup.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      try {
        const page = await browser.newPage();
        await page.setContent(input.html, { waitUntil: "networkidle0" });

        const pdf = await page.pdf({
          format: input.options?.format || "a4",
          landscape: input.options?.landscape || false,
          printBackground: input.options?.printBackground ?? true,
        });

        return {
          success: true,
          pdf: Buffer.from(pdf).toString("base64"),
          contentType: "application/pdf",
        };
      } finally {
        await browser.close();
      }
    }),

  // Generate PDF from URL
  generatePdfFromUrl: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      options: z.object({
        format: z.enum(["a4", "letter", "html"]).default("a4"),
        landscape: z.boolean().default(false),
        waitUntil: z.enum(["networkidle0", "networkidle2", "domcontentloaded", "load"]).default("networkidle0"),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const pup = await getPuppeteer();
      if (!pup) {
        throw new Error("Puppeteer not installed");
      }

      const browser = await pup.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      try {
        const page = await browser.newPage();
        await page.goto(input.url, { waitUntil: input.options?.waitUntil || "networkidle0" });

        const pdf = await page.pdf({
          format: input.options?.format || "a4",
          landscape: input.options?.landscape || false,
          printBackground: true,
        });

        return {
          success: true,
          pdf: Buffer.from(pdf).toString("base64"),
          contentType: "application/pdf",
        };
      } finally {
        await browser.close();
      }
    }),

  // Take screenshot of URL
  screenshot: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      options: z.object({
        fullPage: z.boolean().default(false),
        type: z.enum(["png", "jpeg", "webp"]).default("png"),
        quality: z.number().min(0).max(100).optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const pup = await getPuppeteer();
      if (!pup) {
        throw new Error("Puppeteer not installed");
      }

      const browser = await pup.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      try {
        const page = await browser.newPage();
        
        if (input.options?.width || input.options?.height) {
          await page.setViewport({
            width: input.options.width || 1280,
            height: input.options.height || 720,
          });
        }

        await page.goto(input.url, { waitUntil: "networkidle0" });

        const screenshot = await page.screenshot({
          fullPage: input.options?.fullPage || false,
          type: input.options?.type || "png",
          quality: input.options?.quality,
        });

        return {
          success: true,
          image: Buffer.from(screenshot as Buffer).toString("base64"),
          contentType: `image/${input.options?.type || "png"}`,
        };
      } finally {
        await browser.close();
      }
    }),

  // Check if Puppeteer is available
  status: protectedProcedure.query(async () => {
    const pup = await getPuppeteer();
    return {
      available: !!puppeteer,
      version: pup?.package?.version || "unknown",
    };
  }),
});
