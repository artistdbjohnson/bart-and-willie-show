import { getEpisodes } from "@/lib/now-playing";

export const revalidate = 900;

export async function GET() {
  return Response.json(await getEpisodes(10));
}
