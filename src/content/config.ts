import { defineCollection, z } from "astro:content";

// Define the FAQ collection schema
const faqCollection = defineCollection({
  type: "data",
  schema: z.object({
    data: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
      }),
    ),
  }),
});

// Export the collections object
export const collections = {
  faq: faqCollection,
};
