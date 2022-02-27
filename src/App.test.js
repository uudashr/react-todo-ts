import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  describe('when not authenticated', () => {
    it('renders log in page by default on "/"', () => {
      renderWithRouter(<App />);
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders log in page on "/login"', () => {
      renderWithRouter(<App />, { route: '/login' });
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders sign up page on "/signup"', () => {
      renderWithRouter(<App />, { route: '/signup' });
  
      const title = screen.getByText('Sign up', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders/redirect to log in page on "/todo"', () => {
      renderWithRouter(<App />, { route: '/todo' });
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    it('renders log in page by default on "/"', () => {
      renderWithRouter(<App />);
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders log in page on "/login"', () => {
      renderWithRouter(<App />, { route: '/login' });
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders sign up page on "/signup"', () => {
      renderWithRouter(<App />, { route: '/signup' });
  
      const title = screen.getByText('Sign up', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders to tasks page on "/todo"', async () => {
      const todoClient = {
        logIn: jest.fn((email, password) => Promise.resolve()),
        token: jest.fn(() => 'i-am-a-token'),
        signUp: jest.fn((email, name, password) => Promise.resolve()),
        userInfo: jest.fn(() => ({ email: 'john.appleseed@mail.com', name: 'John Appleseed' })),
        logOut: jest.fn(),
        addTask: jest.fn(name => Promise.resolve()),
        allTasks: jest.fn(() => Promise.resolve([])),
        outstandingTasks: jest.fn(() => Promise.resolve([])),
        completedTasks: jest.fn(() => Promise.resolve([])),
        updateTaskStatus: jest.fn((id, completed) => Promise.resolve()),
        deleteTask: jest.fn(id => Promise.resolve())
      };

      renderWithRouter(<App todoClient={todoClient} />, { route: '/todo' });
  
      const title = screen.getByText('Todo', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();

      await waitFor(() => {
        expect(todoClient.outstandingTasks).toBeCalled();
      });

      await waitFor(() => {
        expect(todoClient.completedTasks).toBeCalled();
      });
    });
  });
});

function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
}