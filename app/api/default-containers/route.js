import { getDefaultContainers } from "@/app/_lib/data/containers.data";

export async function GET() {
  const rows = await getDefaultContainers(); // should return array of names or rows with name
  const names = (rows || [])
    .map((r) => (typeof r === "string" ? r : r?.name))
    .filter(Boolean);

  return Response.json({ names });
}
