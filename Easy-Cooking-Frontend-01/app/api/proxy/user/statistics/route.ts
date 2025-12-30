
const BASE_URL = "http://localhost:8081/api/user/statistics";

export async function proxyGET(path: string, req: Request) {
  const token = req.headers.get("authorization");

  if (!token) {
    return new Response(JSON.stringify({ message: "Thiếu token!" }), {
      status: 401,
    });
  }

  const url = `${BASE_URL}/${path}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Lỗi server proxy", err }), {
      status: 500,
    });
  }
}
