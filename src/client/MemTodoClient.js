
class MemTodoClient {
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

  logIn(email, password) {
    return new Promise((resolve, reject) => {
      const acc = this._accounts.find(acc => acc.email === email && acc.password === password);
      if (!acc) {
        return reject(new ApiError('invalid_credentials', 'Invalid username or password'))
      }

      this._tokenParts = ['token', email, new Date().getTime()];
      resolve(this._tokenParts.join('-'))
    });
  }

  token() {
    if (!this._tokenParts) {
      return undefined;
    }
    
    return this._tokenParts.join('-');
  }

  signUp(email, name, password) {
    return new Promise((resolve, reject) => {
      const acc = this._accounts.find(acc => acc.email === email);
      if (acc) {
        return reject(new ApiError('email_used', 'Email already used'));
      }

      this._accounts = [...this._accounts, { email, name, password }];
      resolve();
    });
  }

  _authenticatedId() {
    if (this._tokenParts) {
      return this._tokenParts[1];
    }

    return undefined;
  }

  userInfo() {
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

  logOut() {
    this._tokenParts = undefined;
  }

  addTask(name) {
    return new Promise((resolve, reject) => {
      const authId = this._authenticatedId();
      if (!authId) {
        return reject(new Error('Unauthorized'));
      }

      const id = ++this._taskSequenceId;
      this._tasks = [...this._tasks, { id, name, ownerId: authId }];
      resolve();
    });
  }

  allTasks() {
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

  outstandingTasks() {
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

  completedTasks() {
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

  updateTaskStatus(id, completed) {
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
          return  { ...task, completed };
        }
    
        return task;
      });
      resolve()
    });
  }

  updateTaskName(id, name) {
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
          return  { ...task, name };
        }

        return task;
      })
      resolve();
    });
  }

  deleteTask(id) {
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
      resolve();
    });
  }
}

export default MemTodoClient;

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