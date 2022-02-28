import axios, { AxiosInstance } from 'axios';

type TokenStorage = {
  get: () => string | null;
  set: (value: string) => void;
  clear: () => void;
};

type Options = {
  baseURL?: string;
  timeout?: number;
  tokenStorage?: TokenStorage
};

type UserInfo = {
  name: string;
  email: string;
}

type Task = {
  id: string;
  name: string;
  completed?: boolean;
};

export default class AxiosTodoClient {
  private axiosInstance: AxiosInstance;
  private tokenStorage: TokenStorage;

  constructor({ baseURL = 'http://localhost:3500', timeout = 1000, tokenStorage = memTokenStorage() }: Options) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
    });

    this.tokenStorage = tokenStorage || memTokenStorage();
  }

  logIn(email: string, password: string): Promise<string> {
    return this.axiosInstance.post('/authenticate', {
      email, password, type: 'web'
    }, {
      withCredentials: true
    }).then(res => {
      const token = res.data.token;
      this.tokenStorage.set(token);
      return token;
    }).catch(err => {
      const res = err.response;
      if (res.status === 401) {
        const { code, message } = res.data.error;
        return Promise.reject(new ApiError(code, message));
      }

      return Promise.reject(err);
    });
  }

  token(): string | null {
    return this.tokenStorage.get();
  }

  signUp(email: string, name: string, password: string): Promise<void> {
    return this.axiosInstance.post('/register', {
      email, name, password
    }).then(res => undefined)
      .catch(err => {
        const res = err.response;
        if (res.status === 409) {
          const { code, message } = res.data.error;
          return Promise.reject(new ApiError(code, message));
        }

        return Promise.reject(err);
      });
  }

  userInfo(): Promise<UserInfo> {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.get('/userinfo', {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => {
      return { email: res.data.email, name: res.data.name };
    });
  }

  logOut(): void {
    this.tokenStorage.clear();
  }

  addTask(name: string): Promise<void> {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.post('/tasks', { name }, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => undefined);
  }

  allTasks(): Promise<Task[]> {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.get('/tasks', {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => {
      return res.data;
    });
  }

  outstandingTasks(): Promise<Task[]> {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.get('/tasks', {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      params: { completed: false },
      withCredentials: true,
    }).then((res) => {
      return res.data;
    });
  }

  completedTasks(): Promise<Task[]> {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.get('/tasks', {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      params: { completed: true },
      withCredentials: true,
    }).then(res => {
      return res.data;
    });
  }

  updateTaskStatus(id: number, completed: boolean): Promise<void> {
    // TODO: need to capture 401 to force logOut
    if (completed) {
      return this.axiosInstance.put(`/tasks/${id}/completed`, undefined, {
        headers: {
          'Authorization': `Bearer ${this.tokenStorage.get()}`,
        },
        withCredentials: true,
      }).then(res => undefined);
    }

    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.delete(`/tasks/${id}/completed`, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => undefined);
  }

  updateTaskName(id: number, name: string): Promise<void> {
    return this.axiosInstance.put(`/tasks/${id}/name`, name, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
        'Content-Type': 'text/plain'
      },
      withCredentials: true,
    }).then(res => undefined)
      .catch(err => {
        const res = err.response;
        if (res.status === 400) {
          const { code, message } = res.data.error;
          return Promise.reject(new ApiError(code, message));
        }

        return Promise.reject(err);
      });
  }

  deleteTask(id: number): Promise<void> {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.delete(`/tasks/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => undefined);
  }
}

class ApiError extends Error {
  private code: string;

  constructor(code: string, message: string) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = 'ApiError';
    this.code = code;
  }
}

export function memTokenStorage(): TokenStorage {
  let token: string | null;

  const get = (): string | null => {
    return token;
  }

  const set = (value: string): void => {
    token = value;
  }

  const clear = (): void => {
    token = null;
  }

  return { get, set, clear };
}

export function localTokenStorage(key: string): TokenStorage {
  const get = (): string | null => {
    return localStorage.getItem(key);
  }

  const set = (value: string): void => {
    localStorage.setItem(key, value);
  }

  const clear = (): void => {
    localStorage.removeItem(key);
  }

  return { get, set, clear };
}