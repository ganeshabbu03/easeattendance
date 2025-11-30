import { QueryClient, QueryFunction } from "@tanstack/react-query";

function getUserId(): string | null {
  try {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.id || null;
    }
  } catch {
    return null;
  }
  return null;
}

function getAuthHeaders(): Record<string, string> {
  const userId = getUserId();
  if (userId) {
    return { "x-user-id": userId };
  }
  return {};
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.filter(k => k !== null && k !== undefined).join("/");
    const res = await fetch(url, {
      credentials: "include",
      headers: getAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
