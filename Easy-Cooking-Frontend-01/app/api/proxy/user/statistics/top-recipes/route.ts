import { proxyGET } from "../route";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const sortBy = url.searchParams.get("sortBy") || "views";
  const limit = url.searchParams.get("limit") || "5";

  return proxyGET(`top-recipes?sortBy=${sortBy}&limit=${limit}`, req);
}
