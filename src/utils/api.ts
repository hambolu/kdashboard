// API utilities

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function(this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args) as ReturnType<T>;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

export async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let retries = 0;
  while (true) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429 && retries < maxRetries) {
        // Get retry-after header or use exponential backoff
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retries) * 1000;
        
        console.log(`Rate limited. Retrying after ${delay}ms...`);
        await wait(delay);
        retries++;
        continue;
      }
      
      return response;
    } catch (error) {
      if (retries < maxRetries) {
        const delay = Math.pow(2, retries) * 1000;
        console.log(`Request failed. Retrying after ${delay}ms...`);
        await wait(delay);
        retries++;
        continue;
      }
      throw error;
    }
  }
}
