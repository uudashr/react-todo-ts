import React from 'react';

import { Input, Space, Button } from "antd";

type Callback = (error?: Error) => void;

type Handler = () => void;
type SaveHandler = (value: string, callback: Callback) => void;
type CancelHandler = Handler;

const NOOP: Handler = () => {};
const NOOP_SAVE: SaveHandler = (value: string, callback: Callback) => callback();


type TaskEditFormProps = {
  value?: string;
  onSave?: SaveHandler;
  onCancel?: CancelHandler;
};

export default function TaskEditForm({ value = '', onSave = NOOP_SAVE, onCancel = NOOP}: TaskEditFormProps) {
  const [taskName, setTaskName] = React.useState(value);
  const [saving, setSaving] = React.useState(false);

  const handleTaskNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaskName(event.target.value);
  };

  const handleSave = () => {
    if (!taskName) {
      return;
    }

    setSaving(true);
    onSave(taskName, (err) => {
      if (err) {
        setSaving(false);
      }
    });
  };

  const handleKeyEnter = () => {
    if (!taskName) {
      return;
    }

    setSaving(true);
    onSave(taskName, (err) => {
      if (err) {
        setSaving(false);
      }
    });
  };

  const handleKeyEscape = () => {
    onCancel();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return;
    }

    handleKeyEnter();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    handleKeyEscape();
  };

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
        <Input 
          value={taskName} 
          onChange={handleTaskNameChange} 
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Space>
          <Button
            type='primary'
            size='small'
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>

          <Button 
            size='small' 
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Space>
      </Space>
  );
}
