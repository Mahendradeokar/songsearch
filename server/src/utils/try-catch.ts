type Result<T> = { data: T; error?: never } | { data?: never; error: Error };

export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
