import axios from "axios";

export function getErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return error.response?.status;
  return undefined;
}

export function handleError(error: unknown, fallbackMessage: string): never {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    if (response) {
      const status = response.status;
      const statusText = response.statusText;
      const message = response.data.message;
      let finalMessage = "";
      if (status === 412) {
        finalMessage = "Please reload the resource."
      }
      throw new Error(`Error ${status} ${statusText}: ${message}. ${finalMessage}`)
    }
  }
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    throw new Error(error.message);
  }
  console.error(error);
  throw new Error(fallbackMessage);
}
