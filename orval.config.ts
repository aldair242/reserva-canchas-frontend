import { defineConfig } from 'orval';

export default defineConfig({
  reservaCanchas: {
    input: {
      target: './docs/openapi.json',
      validation: false,
    },
    output: {
      mode: 'split',
      target: './src/api/endpoints.ts',
      schemas: './src/api/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
