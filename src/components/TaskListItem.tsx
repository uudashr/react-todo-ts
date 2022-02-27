import React from 'react';

import { List } from "antd";

import TaskEditForm from './TaskEditForm';
import TaskView from './TaskView';

import './TaskListItem.css';

type NotifyCallback = () => void;

export class Group {
  private callbacks: NotifyCallback[];
  
  constructor() {
    this.callbacks = [];
  }

  register(callback: NotifyCallback) {
    this.callbacks = [...this.callbacks, callback];
  }

  unregister(callback: NotifyCallback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  notify(callback: NotifyCallback) {
    this.callbacks.filter(cb => cb !== callback).forEach(cb => cb());
  }
}

type Callback = (error?: Error) => void;

export type Task = {
  id: number;
  name: string;
  completed?: boolean;
};

const EMPTY_TASK: Task = {
  id: 0,
  name: '',
  completed: false
};

type StatusChangeEvent = {
  id: number;
  completed: boolean;
};

type NameChangeEvent = {
  id: number;
  name: string;
}

export type StatusChangeHandler = (event: StatusChangeEvent, callback: Callback) => void;
export type NameChangeHandler = (event: NameChangeEvent, callback: Callback) => void;
export type DeleteHandler = (id: number, callback: Callback) => void;

const NOOP_STATUS_CHANGE = (event: StatusChangeEvent, callback: Callback) => callback();
const NOOP_NAME_CHANGE_HANDLER = (event: NameChangeEvent, callback: Callback) => callback();
const NOOP_DELETE = (id: number, callback: Callback) => callback();

type TaskListItemProps = {
  task?: Task;
  onStatusChange?: StatusChangeHandler;
  onNameChange?: NameChangeHandler;
  onDelete?: DeleteHandler;
  group?: Group;
};

export default function TaskListItem({ task = EMPTY_TASK, onStatusChange = NOOP_STATUS_CHANGE, onNameChange = NOOP_NAME_CHANGE_HANDLER, onDelete = NOOP_DELETE, group }: TaskListItemProps) {
  const [editMode, setEditMode] = React.useState(false);

  const handleStatusChange = (completed: boolean, done: Callback) => {
    group?.notify(groupCallback);

    if (!task) {
      return;
    }

    onStatusChange({id: task.id, completed}, done);
  };

  const handleEdit = () => {
    group?.notify(groupCallback);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handleNameChange = (name: string) => {
    onNameChange({id: task.id, name}, (err) => {
      if (err) {
        return;
      }

      setEditMode(false);
    });
  };

  const handleDelete = (done: Callback) => {
    group?.notify(groupCallback);

    if (!task) {
      return;
    }

    onDelete(task.id, done);
  };

  const groupCallback = React.useCallback(
    () => {
      setEditMode(false);
    },
    []
  );

  React.useEffect(() => {
    group?.register(groupCallback);
    return () => {
      group?.unregister(groupCallback);
    };
  }, [groupCallback, group]);

  return (
    <List.Item className='hoverable'>
      {editMode ?
        <TaskEditForm 
          value={task?.name}
          onSave={handleNameChange}
          onCancel={handleCancelEdit}
        />  
        :
        <TaskView 
          name={task?.name} 
          completed={task?.completed} 
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      }
    </List.Item>
  );
}
