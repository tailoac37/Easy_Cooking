import { proxyGET } from "../route";

export async function GET(req: Request) {
  return proxyGET("overview", req);
}
