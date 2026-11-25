import Axios, { type AxiosError, type AxiosRequestConfig } from 'axios';

const getBaseUrl = (): string => {
  try {
    return import.meta.env.VITE_API_URL || 'http://localhost:8080';
  } catch {
    return 'http://localhost:8080';
  }
};

export const AXIOS_INSTANCE = Axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar Authorization: Bearer
AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar 401 y errores de red
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Soporte de cancelación para React Query
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
