/**
 * Re-export of the API client from client.ts
 * This file exists for backward compatibility.
 * New code should import directly from 'src/core/api'.
 */

import { apiClient } from './client';
export default apiClient;