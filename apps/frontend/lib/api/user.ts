import type { User, UserLogin, UserSetupRequest } from "@/types/user";

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function createUser(request: UserSetupRequest): Promise<User> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(
      await getErrorMessage(
        res,
        "Couldn't create your account. Please try again.",
      ),
    );
  }
  return res.json();
}

export async function loginUser(request: UserLogin): Promise<User> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const fallback =
      res.status === 404
        ? "Invalid email or password."
        : "Couldn't log you in. Please try again.";

    throw new Error(await getErrorMessage(res, fallback));
  }

  return res.json();
}
