import React from 'react';
import { Row, Col, Button, Input } from "antd";

type Callback = (error?: Error) => void;

type AddHandler = (name: string, callback: Callback) => void;

const NOOP_ADD_HANDLER = (name: string, callback: Callback) => callback();

type TaskFormProps = {
  nameValue?: string;
  onAdd?: AddHandler;
};

export default function TaskForm({ onAdd = NOOP_ADD_HANDLER, nameValue = ''}: TaskFormProps) {
  const [name, setName] = React.useState(nameValue);
  const [addTaskEnabled, setAddTaskEnabled] = React.useState(!!nameValue);
  const [loading, setLoading] = React.useState(false);

  // TODO: how to use useRef?
  const inputRef = React.useRef<any>(undefined);

  const handleClick = () => {
    setLoading(true);
    onAdd(name, (err) => {
      setLoading(false);
      inputRef.current.focus();
      setName('');
    });
  };

  const handleKeyEnter = () => {
    if (!name) {
      return;
    }

    setLoading(true);
    onAdd(name, (err) => {
      setLoading(false);
      setName('');
      inputRef.current.focus();
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return;
    }

    handleKeyEnter();
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  React.useEffect(() => {
    setAddTaskEnabled(name.length !== 0);
  }, [name]);

  return (
    <Row gutter={10}>
      <Col flex={1}>
        <Input
          placeholder='Enter task name'
          value={name}
          onChange={handleNameChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
          ref={inputRef} />
      </Col>
      <Col>
        <Button
          data-testid='add-task'
          type='primary'
          onClick={handleClick}
          disabled={!addTaskEnabled}
          loading={loading}
        >
          Add task
        </Button>
      </Col>
    </Row>
  );
}
