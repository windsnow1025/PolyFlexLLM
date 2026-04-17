export const StorageKeys = {
  Token: "token",
  APIBaseURLs: "apiBaseURLs",
  APIBaseURLsOptions: "apiBaseURLsOptions",
  DeveloperMode: "developerMode",
}

export const AuthorEmail = "windsnow1025@windsnow1025.com";

export const getBaseUrl = (): string => {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL environment variable is not set");
    }
    return process.env.FRONTEND_URL;
  }
  return "http://localhost:3000";
};
