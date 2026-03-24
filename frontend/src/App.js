import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Welcome from './pages/Welcome';
import CustomerProfile from './pages/CustomerProfile';
import Visitations from './pages/Visitations';
import './App.css';

// Routes with name=null are excluded from the navigation menu
const routes = [
  { path: '/',             name: 'Home',        component: Welcome },
  { path: '/profile',      name: 'Customers',   component: CustomerProfile },
  { path: '/profile/:id',  name: null,          component: CustomerProfile },
  { path: '/visitations',  name: 'Visitations', component: Visitations },
];

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation routes={routes.filter((r) => r.name)} />
        <main className="main-content">
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.component />}
              />
            ))}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

