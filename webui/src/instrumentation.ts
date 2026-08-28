export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (!process.env["AUTH_DOMAIN"]) {
      throw new Error("Env 'AUTH_DOMAIN' missing");
    }

    try {
      new URL(process.env["AUTH_DOMAIN"]);
    } catch (e) {
      throw new Error(`${process.env["AUTH_DOMAIN"]} is not a valid URL`);
    }

    if (!process.env["AUTH_CLIENT_ID"]) {
      throw new Error("Env 'AUTH_CLIENT_ID' missing");
    }

    if (!process.env["AUTH_CALLBACK"]) {
      throw new Error("Env 'AUTH_CALLBACK' missing");
    }
  }
}
