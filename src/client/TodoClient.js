import axios from 'axios';

class TodoClient {
  constructor(opts) {
    const baseURL = opts?.baseURL || 'http://localhost:3500';
    const timeout = opts?.timeout || 1000;

    this.axiosInstance = axios.create({
      baseURL,
      timeout,
    });

    this.tokenStorage = opts?.tokenStorage || memTokenStorage();
  }

  logIn(email, password) {
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
        const {code, message} = res.data.error;
        return Promise.reject(new ApiError(code, message, { cause: err }));
      }

      return Promise.reject(err);
    });
  }

  token() {
    return this.tokenStorage.get();
  }

  signUp(email, name, password) {
    return this.axiosInstance.post('/register', {
      email, name, password
    }).then(res => undefined)
    .catch(err => {
      const res = err.response;
      if (res.status === 409) {
        const {code, message} = res.data.error;
        return Promise.reject(new ApiError(code, message, { cause: err }));
      }

      return Promise.reject(err);
    });
  }

  userInfo() {
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

  logOut() {
    this.tokenStorage.clear();
  }

  addTask(name) {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.post('/tasks', { name }, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => undefined);
  }

  allTasks() {
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

  outstandingTasks() {
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

  completedTasks() {
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

  updateTaskStatus(id, completed) {
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

  updateTaskName(id, name) {
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
        const {code, message} = res.data.error;
        return Promise.reject(new ApiError(code, message, { cause: err }));
      }

      return Promise.reject(err);
    });
  }

  deleteTask(id) {
    // TODO: need to capture 401 to force logOut
    return this.axiosInstance.delete(`/tasks/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.tokenStorage.get()}`,
      },
      withCredentials: true,
    }).then(res => undefined);
  }
}

export default TodoClient;

class ApiError extends Error {
  constructor(code, message, ...params) {
    super(message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = 'ApiError';
    this.code = code;
  }
}

export function memTokenStorage() {
  let token = undefined;

  const get = () => {
    return token;
  }

  const set = (val) => {
    token = val;
  }

  const clear = () => {
    token = undefined;
  }

  return { get, set, clear };
}

export function localTokenStorage(key) {
  const get = () => {
    return localStorage.getItem(key);
  }

  const set = (token) => {
    localStorage.setItem(key, token);
  }

  const clear = () => {
    localStorage.removeItem(key);
  }

  return { get, set, clear };
}