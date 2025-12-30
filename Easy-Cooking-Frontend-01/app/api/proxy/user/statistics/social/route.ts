import { proxyGET } from "../route";

export async function GET(req: Request) {
  return proxyGET("social", req);
}
