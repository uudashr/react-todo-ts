type UserInfo = {
  name: string;
  email: string;
};

type Task = {
  id: number;
  name: string;
  completed?: boolean;
};

type Token = [string, string, number]

namespace Entities {
  export type Account = {
    email: string;
    name: string;
    password: string;
  };

  export type Task = {
    id: number;
    name: string;
    completed?: boolean;
    ownerId: string;
  };
}

export default class MemTodoClient {
  private _accounts: Entities.Account[];

  private _taskSequenceId: number = 3;
  private _tasks: Entities.Task[];
  private _token?: Token;

  constructor() {
    this._accounts = [
      { email: 'uudashr@gmail.com', name: 'Nuruddin Ashr', password: 'secret' },
    ];

    this._taskSequenceId = 3;
    this._tasks = [
      { id: 1, name: 'Follow up SRE Support', completed: true, ownerId: 'uudashr@gmail.com' },
      { id: 2, name: 'Read IAM Service Spec', ownerId: 'uudashr@gmail.com' },
      { id: 3, name: 'Research chat protocols', ownerId: 'uudashr@gmail.com' },
    ];
  }

  logIn(email: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const acc = this._accounts.find(acc => acc.email === email && acc.password === password);
      if (!acc) {
        return reject(new ApiError('invalid_credentials', 'Invalid username or password'))
      }

      this._token = ['token', email, new Date().getTime()];
      resolve(this._token.join('-'))
    });
  }

  token(): string | undefined {
    if (!this._token) {
      return undefined;
    }

    return this._token.join('-');
  }

  signUp(email: string, name: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const acc = this._accounts.find(acc => acc.email === email);
      if (acc) {
        return reject(new ApiError('email_used', 'Email already used'));
      }

      this._accounts = [...this._accounts, { email, name, password }];
      resolve(undefined);
    });
  }

  _authenticatedId() {
    if (this._token) {
      return this._token[1];
    }

    return undefined;
  }

  userInfo(): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const acc = this._accounts.find(acc => acc.email === authId)
      if (!acc) {
        return reject(new Error('Not found'));
      }

      const { email, name } = acc;
      resolve({ email, name });
    });
  }

  logOut(): void {
    this._token = undefined;
  }

  addTask(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const id = ++this._taskSequenceId;
      this._tasks = [...this._tasks, { id, name, ownerId: authId }];
      resolve(undefined);
    });
  }

  allTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const filteredTasks = this._tasks.filter(task => {
        return task.ownerId === authId
      }).map(({ id, name, completed }) => ({ id, name, completed }));
      resolve(filteredTasks);
    });
  }

  outstandingTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const filteredTasks = this._tasks.filter(task => {
        return task.ownerId === authId
      }).filter(task => !task.completed)
        .map(({ id, name, completed }) => ({ id, name, completed }));

      resolve(filteredTasks);
    });
  }

  completedTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const filteredTasks = this._tasks.filter(task => {
        return task.ownerId === authId
      }).filter(task => task.completed)
        .map(({ id, name, completed }) => ({ id, name, completed }));

      resolve(filteredTasks);
    });
  }

  updateTaskStatus(id: number, completed: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const found = this._tasks.find(task => (
        task.id === Number(id) && task.ownerId === authId
      ));

      if (!found) {
        return reject(new Error("Not found"));
      }

      this._tasks = this._tasks.map(task => {
        if (task.id === found.id) {
          return { ...task, completed };
        }

        return task;
      });
      resolve(undefined)
    });
  }

  updateTaskName(id: number, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      if (!name) {
        return reject(new ApiError('empty_name', 'Name is empty'));
      }

      const found = this._tasks.find(task => (
        task.id === id && task.ownerId === authId
      ));
      if (!found) {
        return reject(new Error("Not found"))
      }

      this._tasks = this._tasks.map(task => {
        if (task.id === found.id) {
          return { ...task, name };
        }

        return task;
      })
      resolve(undefined);
    });
  }

  deleteTask(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const found = this._tasks.find(task => (
        task.id === id &&
        task.ownerId === authId
      ));

      if (!found) {
        return reject(new Error('Not found'));
      }

      this._tasks = this._tasks.filter(task => task.id !== found.id);
      resolve(undefined);
    });
  }
}

class ApiError extends Error {
  code: string
  
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }

    this.name = 'ApiError';
    this.code = code;
  }
}