/**
 * Provider Function Helper
 * Calls @Tool decorated methods on provider backends via /integrations/function
 */

import { wpApiFetch } from './client';

export interface ProviderFunctionOptions {
  integrationId: string;
  functionName: string;
  params?: Record<string, any>;
}

/**
 * Call a provider function (e.g., 'channels', 'boards', 'subreddits')
 * This maps to backend @Tool decorated methods
 */
export async function callProviderFunction<T = any>(
  options: ProviderFunctionOptions
): Promise<T> {
  const { integrationId, functionName, params = {} } = options;

  try {
    // Call WordPress REST endpoint which will proxy to PostQuee API
    const result = await wpApiFetch<T>({
      path: `integrations/${integrationId}/function`,
      method: 'POST',
      data: {
        name: functionName,
        params,
      },
    });

    return result;
  } catch (error) {
    console.error(`Failed to call provider function ${functionName}:`, error);
    throw error;
  }
}

/**
 * React hook for calling provider functions
 */
export function useProviderFunction() {
  const call = async <T = any>(
    integrationId: string,
    functionName: string,
    params?: Record<string, any>
  ): Promise<T> => {
    return callProviderFunction<T>({ integrationId, functionName, params });
  };

  return { call };
}
