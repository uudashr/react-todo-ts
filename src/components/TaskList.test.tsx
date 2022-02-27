import { render, screen, fireEvent } from '@testing-library/react';
import TaskList from './TaskList';

describe('TaskList with no properties', () => {
  it('renders TaskList with no errors', () => {
    render(<TaskList />);
    // expect no errors
  });
});

describe('TaskList with title', () => {
  it('renders the title', () => {
    const title = 'This is title';
    render(<TaskList title={title} />);

    const element = screen.getByText(title);
    expect(element).toBeInTheDocument();
  });
});

describe('TaskList with tasks', () => {
  const setup = () => {
    const title = 'This is title';
    const tasks = [
      { id: 1, name: 'Follow up SRE Support' },
      { id: 2, name: 'Read IAM Service Spec' },
      { id: 3, name: 'Research chat protocols', completed: true },
    ]

    const handleItemStatusChange = jest.fn();
    const handleItemDelete = jest.fn();

    render(
      <TaskList 
        title={title} 
        tasks={tasks} 
        onItemStatusChange={handleItemStatusChange}
        onItemDelete={handleItemDelete}
      />
    );
    return { title, tasks, handleItemStatusChange, handleItemDelete };
  };


  it('renders the title', () => {
    const { title } = setup();

    const element = screen.getByText(title);
    expect(element).toBeInTheDocument();
  });

  it('renders the TaskListItem', () => {
    const { tasks } = setup();

    const checkboxes = screen.queryAllByRole('checkbox')
    expect(checkboxes).toHaveLength(tasks.length);

    tasks.forEach((task) => {
      const checkbox = screen.getByLabelText(task.name) as HTMLInputElement;
      expect(checkbox.checked).toEqual(task.completed || false);
    });
  });

  test('toggle check/click the task', () => {
    const { tasks, handleItemStatusChange } = setup();
    
    tasks.forEach((task, index) => {
      const checkbox = screen.getByLabelText(task.name);
      fireEvent.click(checkbox);

      expect(handleItemStatusChange).toBeCalledTimes(index + 1);
      const [taskArg, ] = handleItemStatusChange.mock.calls[index];
      expect(taskArg.id).toEqual(task.id);
      expect(taskArg.completed).not.toEqual(task.completed || false);
    });
  });

  test('delete task', () => {
    const { tasks, handleItemDelete } = setup();

    const deleteButtons = screen.queryAllByRole('button', { name: 'Delete' });
    
    tasks.forEach((task, index) => {
      const deleteButton = deleteButtons[index];
      fireEvent.click(deleteButton);

      expect(handleItemDelete).toBeCalledTimes(index + 1);
      const [taskId, ] = handleItemDelete.mock.calls[index];
      expect(taskId).toEqual(task.id);
    });
  });
});