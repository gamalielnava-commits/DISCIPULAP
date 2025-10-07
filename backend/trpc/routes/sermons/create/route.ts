import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(
    z.object({
      title: z.string(),
      speaker: z.string(),
      date: z.string(),
      seriesId: z.string().optional(),
      description: z.string().optional(),
      coverUrl: z.string().optional(),
      audioUrl: z.string().optional(),
      durationSec: z.number().optional(),
      tags: z.array(z.string()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const id = await ChurchDataService.createSermon({
      title: input.title,
      speaker: input.speaker,
      date: input.date,
      seriesId: input.seriesId,
      description: input.description,
      coverUrl: input.coverUrl,
      audioUrl: input.audioUrl,
      durationSec: input.durationSec,
      tags: input.tags,
    });
    return { id };
  });