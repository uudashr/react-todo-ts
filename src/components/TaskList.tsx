import { List, Typography } from "antd";

import TaskListItem, { Group, Task, StatusChangeHandler, NameChangeHandler, DeleteHandler } from './TaskListItem';

const { Title } = Typography;

type TaskListProps = {
  title?: string;
  loading?: boolean;
  tasks?: Task[],
  onItemStatusChange?: StatusChangeHandler;
  onItemNameChange?: NameChangeHandler;
  onItemDelete?: DeleteHandler;
  group?: Group;
}

export default function TaskList({ title, loading = false, tasks = [], onItemStatusChange, onItemNameChange, onItemDelete, group = new Group() }: TaskListProps) {
  const header = title ? <Title level={4}>{title}</Title> : undefined;

  return (
    <List
      style={{ minWidth: '30rem' }}
      bordered
      loading={loading}
      header={header}
      dataSource={tasks}
      renderItem={task => (
        <TaskListItem
          key={task.id} 
          task={task} 
          onStatusChange={onItemStatusChange} 
          onNameChange={onItemNameChange}
          onDelete={onItemDelete}
          group={group}
        />
      )} />
  );
}
