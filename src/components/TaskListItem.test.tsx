import { render, screen, fireEvent } from '@testing-library/react';

import TaskListItem, { Task } from './TaskListItem';
import { act } from 'react-dom/test-utils';

describe('TaskListItem with no task', () => {
  it('renders checkbox', () => {
    render(<TaskListItem />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    const editButton = screen.getByRole('button', { name: 'Edit' })
    expect(editButton).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeInTheDocument();
  });
});

describe('TaskListItem with task', () => {
  const setup = (task: Task) => {
    const handleStatusChange = jest.fn();
    const handleDelete = jest.fn();
    const handleNameChange = jest.fn();

    render(
      <TaskListItem 
        task={task} 
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onNameChange={handleNameChange}
      />
    );

    return { handleStatusChange, handleDelete, handleNameChange };
  };

  const testCases = [
    {
      name: 'uncompleted',
      task: {
        id: 10,
        name: 'Learn React JS',
        completed: false
      }
    },
    {
      name: 'uncompleted (completed var is undefined)',
      task: {
        id: 10,
        name: 'Learn React JS',
      }
    },
    {
      name: 'completed',
      task: {
        id: 10,
        name: 'Learn React JS',
        completed: true
      }
    }
  ]

  test.each(testCases)('renders on $name task', ({ task }) => {
    setup(task);

    const checkbox = screen.getByRole('checkbox', { name: task.name }) as HTMLInputElement;
    expect(checkbox.checked).toEqual(task.completed || false);
    

    const editButton = screen.getByRole('button', { name: 'Edit' })
    expect(editButton).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeInTheDocument();
  });

  test.each(testCases)('click checkbox on $name task', ({ task }) => {
    const { handleStatusChange } = setup(task);

    const { completed = false } = task;

    const checkbox = screen.getByRole('checkbox', { name: task.name }) as HTMLInputElement;
    expect(checkbox).toBeEnabled();
    expect(checkbox.checked).toEqual(completed);

    fireEvent.click(checkbox);

    expect(handleStatusChange).toBeCalled();
    const [taskArg, doneArg] = handleStatusChange.mock.calls[0];
    expect(taskArg.completed).toEqual(!completed);
    expect(checkbox).toBeDisabled();
    act(() => doneArg());
  });

  test.each(testCases)('click delete on $name task', ({ task }) => {
    const { handleDelete } = setup(task);

    const checkbox = screen.getByRole('checkbox', { name: task.name});
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    
    expect(checkbox).toBeEnabled();
    expect(deleteButton).toBeEnabled();
    
    fireEvent.click(deleteButton);

    expect(handleDelete).toBeCalled();
    const [idArg, doneArg] = handleDelete.mock.calls[0];
    expect(idArg).toEqual(task.id);
    expect(checkbox).toBeDisabled();
    act(() => doneArg());
  });

  test.each(testCases)('test edit and click save on $name task', ({ task }) => {
    const { handleNameChange } = setup(task);
    const modifiedTaskName = task.name + ' (modified)';

    const checkbox = screen.getByRole('checkbox', { name: task.name});
    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(checkbox).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    const input = screen.getByDisplayValue(task.name);
    const saveButton = screen.getByRole('button', { name: 'Save' });

    expect(input).toHaveFocus();
    expect(checkbox).not.toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
    expect(deleteButton).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: modifiedTaskName } });
    fireEvent.click(saveButton);

    expect(handleNameChange).toBeCalled();
    const [taskArg, doneArg] = handleNameChange.mock.calls[0];
    expect(taskArg.id).toEqual(task.id);
    expect(taskArg.name).toEqual(modifiedTaskName);
    act(() => doneArg());
  });

  test.each(testCases)('test edit and press enter on $name task', ({ task }) => {
    const { handleNameChange } = setup(task);
    const modifiedTaskName = task.name + ' (modified)';

    const checkbox = screen.getByRole('checkbox', { name: task.name});
    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(checkbox).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(editButton);
    const input = screen.getByDisplayValue(task.name);

    expect(input).toHaveFocus();
    expect(checkbox).not.toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
    expect(deleteButton).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: modifiedTaskName } });
    fireEvent.keyPress(input, {key: 'Enter', code: 'Enter', charCode: 13});

    expect(handleNameChange).toBeCalled();
    const [taskArg, doneArg] = handleNameChange.mock.calls[0];
    expect(taskArg.id).toEqual(task.id);
    expect(taskArg.name).toEqual(modifiedTaskName);
    act(() => doneArg());
  });

  test.each(testCases)('test edit and click cancel on $name task', ({ task }) => {
    setup(task);
    const modifiedTaskName = task.name + ' (modified)';

    const checkbox = screen.getByRole('checkbox', { name: task.name });
    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(editButton);
    const input = screen.getByDisplayValue(task.name);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(input).toHaveFocus();
    expect(checkbox).not.toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
    expect(deleteButton).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: modifiedTaskName } });
    fireEvent.click(cancelButton);

    expect(input).not.toBeInTheDocument();
    expect(saveButton).not.toBeInTheDocument();
    expect(cancelButton).not.toBeInTheDocument();
  });

  test.each(testCases)('test edit and press escape on $name task', ({ task }) => {
    setup(task);
    const modifiedTaskName = task.name + ' (modified)';

    const checkbox = screen.getByRole('checkbox', { name: task.name});
    const editButton = screen.getByRole('button', { name: 'Edit' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    fireEvent.click(editButton);
    const input = screen.getByDisplayValue(task.name);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(input).toHaveFocus();
    expect(checkbox).not.toBeInTheDocument();
    expect(editButton).not.toBeInTheDocument();
    expect(deleteButton).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: modifiedTaskName } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape', charCode: 27 });

    expect(input).not.toBeInTheDocument();
    expect(saveButton).not.toBeInTheDocument();
    expect(cancelButton).not.toBeInTheDocument();
  });
});