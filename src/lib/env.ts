import z from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.string(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  TECH_USER_USERNAME: z.string(),
  TECH_USER_PASSWORD: z.string(),
});

const envServer = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL: process.env.API_BASE_URL,
  TECH_USER_USERNAME: process.env.TECH_USER_USERNAME,
  TECH_USER_PASSWORD: process.env.TECH_USER_PASSWORD,
});

if (!envServer.success) {
  console.log("Failed to parse environment variables:");
  console.error(envServer.error.format()); // Log detailed error messages

  throw new Error("There is an error with the server environment variables");
}

export const env = envServer.data;
