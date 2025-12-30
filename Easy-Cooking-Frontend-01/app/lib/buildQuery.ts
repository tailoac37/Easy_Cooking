export function buildQuery(params: Record<string, any>) {
  const searchParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const val = params[key];

    if (Array.isArray(val)) {
      val.forEach((v) => searchParams.append(key, v));
    } else if (val !== undefined && val !== null) {
      searchParams.append(key, val);
    }
  });

  return searchParams.toString();
}
