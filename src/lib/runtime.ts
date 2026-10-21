export const isEphemeral =
  process.env.EPHEMERAL_STORAGE === "1" || (process.env.VERCEL === "1" && process.env.EPHEMERAL_STORAGE !== "0");
