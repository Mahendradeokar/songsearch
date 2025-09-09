import type { ErrorResponse } from "@shared-types";
import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { tryCatch } from "./try-catch";
import { clearAuthToken, getAuthToken } from "./utils";
import { toast } from "sonner";

type Method = "get" | "post" | "put" | "patch" | "delete";
export const BASE_SERVER_URL = `${import.meta.env.VITE_BASE_URL}/api/v1`;
console.log("baser url main ", BASE_SERVER_URL);

export class ApiClient {
  protected client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_SERVER_URL,
    });

    this.client.interceptors.request.use(
      this.requestMiddleware.bind(this),
      this.requestErrorMiddleware.bind(this)
    );

    this.client.interceptors.response.use(
      this.responseMiddleware.bind(this),
      this.responseErrorMiddleware.bind(this)
    );
  }

  protected async requestMiddleware(config: AxiosRequestConfig) {
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config as InternalAxiosRequestConfig;
  }

  protected requestErrorMiddleware(error: unknown) {
    return Promise.reject(error);
  }

  protected responseMiddleware(response: AxiosResponse) {
    return response;
  }

  protected responseErrorMiddleware(error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.status === 401
    ) {
      clearAuthToken();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }

  public static isApiClientError(e: unknown) {
    return axios.isAxiosError<ErrorResponse>(e);
  }

  public async makeRequest<R = unknown, P = unknown>(args: {
    method: Method;
    url: string;
    payload?: P;
    options?: AxiosRequestConfig;
  }): Promise<
    { data: R; error?: never } | { data?: never; error: ErrorResponse }
  > {
    const { method, url, payload, options } = args;
    console.log("base url", BASE_SERVER_URL, import.meta.env.VITE_BASE_URL);
    const axiosMethod = this.client[method].bind(this.client);

    const timeoutId = setTimeout(() => {
      // due to hosting provider
      toast.info("The server is waking up. This may take a minute.");
    }, 4000);

    const { data: response, error } = await tryCatch(
      method === "get" || method === "delete"
        ? axiosMethod(url, options)
        : axiosMethod(url, payload, options)
    );
    clearTimeout(timeoutId);

    if (!error) {
      return { data: response.data as R };
    }

    if (ApiClient.isApiClientError(error) && error.response?.data?.code) {
      return { error: error.response?.data };
    }

    throw error;
  }
}

export const API = new ApiClient();
