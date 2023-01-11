import React from 'react';

import { 
  Row, Col, 
  Space,
  message,
  Divider,
  Typography,
  Button,
} from 'antd';

import {
  BookFilled
} from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Group } from '../components/TaskListItem'

import { useAuth } from '../auth';

const { Title } = Typography;

type TodoProps = {
  taskClient?: TaskClient;
};

type Callback = (error?: Error | any) => void;

type StatusChangeEvent = {
  id: number;
  completed: boolean;
}

type TaskNameChangeEvent = {
  id: number;
  name: string;
}

export default function Todo({ taskClient }: TodoProps) {
  const [outstandingTasks, setOutstandingTasks] = React.useState<Task[]>([]);
  const [outstandingTasksLoading, setOutstandingTasksLoading] = React.useState(false);

  const [completedTasks, setCompletedTasks] = React.useState<Task[]>([]);
  const [completedTasksLoading, setCompletedTasksLoading] = React.useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleAddTask = async (name: string, done: Callback) => {
    if (!taskClient) {
      done();
      return;
    }

    try {
      await taskClient.addTask(name);
      const [tempOutstandingTasks, tempCompletedTasks] = await Promise.all([taskClient.outstandingTasks(), taskClient.completedTasks()]);
      setOutstandingTasks(tempOutstandingTasks);
      setCompletedTasks(tempCompletedTasks);
      done();
      message.success('Task added');
    } catch (e) {
      done(e);
      // TODO: capture Unauthorized and sign out
      if (e instanceof Error) {
        message.error((e as Error).message);
      }
    }
  };

  const handleTaskStatusChange = async (task: StatusChangeEvent, done: Callback) => {
    if (!taskClient) {
      done();
      return
    }

    try {
      await taskClient.updateTaskStatus(task.id, task.completed);
      const [tempOutstandingTasks, tempCompletedTasks] = await Promise.all([taskClient.outstandingTasks(), taskClient.completedTasks()]);
      setOutstandingTasks(tempOutstandingTasks);
      setCompletedTasks(tempCompletedTasks);
      done();
      message.success('Task updated');
    } catch (e) {
      done(e);
      // TODO: capture Unauthorized and sign out
      if (e instanceof Error) {
        message.error((e as Error).message);
      }
    }
  };

  const handleTaskNameChange = async (task: TaskNameChangeEvent, done: Callback) => {
    if (!taskClient) {
      done();
      return
    }

    try {
      await taskClient.updateTaskName(task.id, task.name);
      const [tempOutstandingTasks, tempCompletedTasks] = await Promise.all([taskClient.outstandingTasks(), taskClient.completedTasks()]);
      setOutstandingTasks(tempOutstandingTasks);
      setCompletedTasks(tempCompletedTasks);
      done();
      message.success('Task updated');
    } catch (e) {
      done(e);
      // TODO: capture Unauthorized and sign out
      if (e instanceof Error) {
        message.error((e as Error).message);
      }
    }
  };

  const handleDeleteTask = async (id: number, done: Callback) => {
    if (!taskClient) {
      done();
      return
    }
    
    try {
      await taskClient.deleteTask(id)
      const [tempOutstandingTasks, tempCompletedTasks] = await Promise.all([taskClient.outstandingTasks(), taskClient.completedTasks()]);
      setOutstandingTasks(tempOutstandingTasks);
      setCompletedTasks(tempCompletedTasks);
      done();
      message.success('Task deleted');
    } catch (e) {
      done(e);
      // TODO: capture Unauthorized and sign out
      if (e instanceof Error) {
        message.error((e as Error).message);
      };
    }
  };

  const handleLogOut = () => {
    auth.signOut();
    message.success('Logged out');
    navigate('/login', { replace: true });
  };

  const group = new Group();

  React.useEffect(() => {
    if (!taskClient) {
      return;
    }

    let canceled = false;
    const loadData = async () => {
      if (!canceled) {
        setOutstandingTasksLoading(true);
      }
      try {
        const tempTasks = await taskClient.outstandingTasks()
        if (!canceled) {
          setOutstandingTasks(tempTasks);
        }
      } catch (e) {
        if (!canceled) {
          if (e instanceof Error) {
            message.error((e as Error).message);
          };
        }
        // TODO: capture Unauthorized and sign out
      } finally {
        if (!canceled) {
          setOutstandingTasksLoading(false);
        }
      }
    };

    loadData()
    return () => {
      canceled = true;
    };
  }, [taskClient]);

  React.useEffect(() => {
    if (!taskClient) {
      return;
    }

    let canceled = false;
    const loadData = async () => {
      if (!canceled) {
        setCompletedTasksLoading(true);
      }
      try {
        const tempTasks = await taskClient.completedTasks()
        if (!canceled) {
          setCompletedTasks(tempTasks);
        }
      } catch (e) {
        if (!canceled) {
          if (e instanceof Error) {
            message.error((e as Error).message);
          };
        }
        // TODO: capture Unauthorized and sign out
      } finally {
        if (!canceled) {
          setCompletedTasksLoading(false);
        }
      }
    };

    loadData();
    return () => {
      canceled = true;
    };
  }, [taskClient]);

  return (
    <Row
      justify='center'
      style={{ minHeight: '50vh', padding: '5rem' }}
    >
      <Col>
        <Space direction='vertical'>
          <Row wrap={false} align='middle'>
            <Col flex='auto'>
              <Title>
                <BookFilled /> Todo
              </Title>
            </Col>
            <Col flex='none'>
              <Button type='link' danger onClick={handleLogOut}>Log out</Button>
            </Col>
          </Row>
          
          <TaskForm 
            onAdd={handleAddTask}
          />
          <TaskList 
            title='Tasks'
            tasks={outstandingTasks}
            loading={outstandingTasksLoading}
            onItemStatusChange={handleTaskStatusChange}
            onItemNameChange={handleTaskNameChange}
            onItemDelete={handleDeleteTask}
            group={group}
          />
          <Divider plain dashed>Completed tasks</Divider>
          <TaskList
            tasks={completedTasks}
            loading={completedTasksLoading}
            onItemStatusChange={handleTaskStatusChange}
            onItemNameChange={handleTaskNameChange}
            onItemDelete={handleDeleteTask}
            group={group}
          />
        </Space>
      </Col>
    </Row>
  );
}

export type Task = {
  id: number;
  name: string;
  completed?: boolean
}

export interface TaskClient {
  addTask(name: string): Promise<void>;
  outstandingTasks(): Promise<Task[]>;
  completedTasks(): Promise<Task[]>;
  updateTaskStatus(id: number, completed: boolean): Promise<void>;
  updateTaskName(id: number, name: string): Promise<void>;
  deleteTask(id: number): Promise<void>;
}