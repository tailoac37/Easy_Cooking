import { proxyGET } from "../route";

export async function GET(req: Request) {
  return proxyGET("engagement", req);
}
