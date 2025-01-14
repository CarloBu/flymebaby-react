import { getCollection } from "astro:content";

export async function GET() {
  const faqEntries = await getCollection("faq");
  return new Response(JSON.stringify(faqEntries[0].data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
