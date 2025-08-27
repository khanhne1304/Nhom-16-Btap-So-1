import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { store } from './store';
import AppRouter from './routers/AppRouter';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppRouter />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
