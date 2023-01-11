import React from 'react';

import { Checkbox, Spin, Space, Button } from "antd";
import { LoadingOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

type Callback = (error?: Error) => void;

type Handler = () => void;
type StatusChangeHandler = (completed: boolean, callback: Callback) => void;
type DeleteHandler = (callback: Callback) => void;
type EditHandler = Handler;

const NOOP: Handler = () => {};
const NOOP_STATUS_CHANGE: StatusChangeHandler = (completed: boolean, callback: Callback) => callback();
const NOOP_DELETE: DeleteHandler = (callback: Callback) => callback();

type TaskViewProps = {
  name?: string;
  completed?: boolean;
  onStatusChange?: StatusChangeHandler;
  onDelete?: DeleteHandler;
  onEdit?: EditHandler;
};

export default function TaskView({ name = '', completed = false, onStatusChange = NOOP_STATUS_CHANGE, onDelete = NOOP_DELETE, onEdit = NOOP }: TaskViewProps) {
  const mounted = React.useRef(false);
  
  const [deleting, setDeleting] = React.useState(false);
  const [changingStatus, setChangingStatus] = React.useState(false);

  const handleStatusChange = (completed: boolean) => {
    setChangingStatus(true);
    onStatusChange(completed, (err) => {
      mounted.current && setChangingStatus(false);
    });
  };

  const handleDelete = () => {
    setDeleting(true);
    onDelete((err) => {
      mounted.current && setDeleting(false)
    });
  };

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, []);

  return (
    <>
      <Checkbox
        style={{ width: '100%' }}
        disabled={changingStatus || deleting}
        checked={completed}
        onChange={event => handleStatusChange(event.target.checked)}
      >
        {name}
      </Checkbox>
      <Space>
        <Spin 
          spinning={changingStatus} 
          size='small' 
          indicator={<LoadingOutlined />} 
        />
        <Button 
          aria-label='Edit'
          icon={<EditOutlined />} 
          size='small' 
          className='hover-control' 
          disabled={changingStatus || deleting}
          onClick={onEdit}
        />
        <Button 
          aria-label='Delete'
          icon={<DeleteOutlined />} 
          size='small' 
          danger 
          className='hover-control' 
          disabled={changingStatus}
          loading={deleting}
          onClick={handleDelete} 
        />
      </Space>
    </>
  );
}
