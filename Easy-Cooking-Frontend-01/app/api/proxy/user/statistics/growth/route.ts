import { proxyGET } from "../route";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const days = url.searchParams.get("days") || "30";
  return proxyGET(`growth?days=${days}`, req);
}
