import z from "zod";

const envSchema = z.object({
  API_BASE_URL: z.string().url().default("http://localhost:8000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const envServer = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
});

if (!envServer.success) {
  console.log(envServer);
  console.error(envServer.error.issues);
  throw new Error("There is an error with the server environment variables");
}

export const env = envServer.data;
