import * as React from 'react';

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthClient, AuthProvider, RequireAuth } from './auth'

import Todo, { TaskClient } from './routes/Todo';
import LogIn from './routes/LogIn';
import SignUp, { AccountClient } from './routes/SignUp';

import './App.css';

type AppProps = {
  todoClient: AuthClient & AccountClient & TaskClient;
}

export default function App({ todoClient }: AppProps) {
  return (
    <AuthProvider authClient={todoClient}>
      <Routes>
        <Route path="/" element={<Navigate to='/todo' />} />
        <Route 
          path="/todo" 
          element={
            <RequireAuth>
              <Todo taskClient={todoClient} />
            </RequireAuth>
          } 
        />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signUp" element={<SignUp accountClient={todoClient} />} />
      </Routes>
    </AuthProvider>
  );
}
