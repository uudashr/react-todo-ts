import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import TaskForm from './TaskForm';


describe('empty TaskForm', () => {
  const setup = () => {
    render(<TaskForm />);
  };

  it('renders name text input', () => {
    setup();

    const nameInput = screen.getByPlaceholderText('Enter task name');

    expect(nameInput).toHaveDisplayValue('');
    expect(nameInput).toBeInTheDocument();
  });
  
  it('has disabled add task button', () => {
    setup();

    const addTask = screen.getByRole('button');

    expect(addTask).toHaveTextContent('Add task');
    expect(addTask).toBeDisabled();
  });

  test('enter task name', () => {
    setup();
    
    const nameInput = screen.getByPlaceholderText('Enter task name');
    const addTask = screen.getByRole('button');

    fireEvent.change(nameInput, { target: { value: 'Create spec document' } });
    expect(nameInput).toHaveDisplayValue('Create spec document');
    expect(addTask).toBeEnabled();
  });
});


describe('non empty TaskForm', () => {
  const nameValue = 'Hello';

  const setup = () => {
    const handleAdd = jest.fn(); // (name, done)
    render(<TaskForm nameValue={nameValue} onAdd={handleAdd} />);
    return {handleAdd};
  };

  it('renders value on the name input', () => {
    setup();

    const nameInput = screen.getByPlaceholderText('Enter task name');
    expect(nameInput).toHaveDisplayValue(nameValue);
    expect(nameInput).toBeInTheDocument();
  });

  it('has enabled add task button', () => {
    setup();

    const addTask = screen.getByRole('button', { name: 'Add task' });
    expect(addTask).toBeEnabled();
  });

  test('click add task button', () => {
    const {handleAdd} = setup();

    const nameInput = screen.getByPlaceholderText('Enter task name');
    const addTask = screen.getByRole('button', { name: 'Add task' });
    
    expect(nameInput).toHaveDisplayValue(nameValue);
    expect(nameInput).toBeEnabled();

    fireEvent.click(addTask);

    expect(handleAdd).toBeCalled();
    const [nameArg, doneArg] = handleAdd.mock.calls[0];
    expect(nameArg).toBe(nameValue);
    expect(nameInput).toBeDisabled();

    act(() => doneArg());

    expect(nameInput).toBeEnabled();
    expect(nameInput).toHaveDisplayValue('');
  });

  test('press enter key on name input', () => {
    const {handleAdd} = setup();

    const nameInput = screen.getByPlaceholderText('Enter task name');
    
    expect(nameInput).toHaveDisplayValue(nameValue);
    expect(nameInput).toBeEnabled();

    fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(handleAdd).toBeCalled();
    const [nameArg, doneArg] = handleAdd.mock.calls[0];
    expect(nameArg).toBe(nameValue);
    expect(nameInput).toBeDisabled();

    act(() => doneArg());

    expect(nameInput).toBeEnabled();
    expect(nameInput).toHaveDisplayValue('');
  });

  test('press non enter key on name input', () => {
    const {handleAdd} = setup();
    
    const nameInput = screen.getByPlaceholderText('Enter task name');
    
    expect(nameInput).toHaveDisplayValue(nameValue);
    expect(nameInput).toBeEnabled();

    fireEvent.keyPress(nameInput, { key: 'o', code: 'KeyO', charCode: 79 });
    fireEvent.keyPress(nameInput, { key: 'l', code: 'KeyL', charCode: 76 });

    expect(handleAdd).not.toBeCalled();
  })
});
