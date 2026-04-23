import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Login from '../views/account/Authentication/Login/Login.jsx';
import Signup from '../views/account/Authentication/Sigup/Sigup.jsx';
import SettingPage from '../views/account/setting/page.jsx';
import Main from '../views/Main.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

const theme = createTheme({
    typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    palette: {
        mode: 'light',
        background: {
            default: '#f5f5f7',
            paper: '#ffffff',
        },
        text: {
            primary: '#101114',
            secondary: '#6b6d76',
        },
    },
    shape: {
        borderRadius: 18,
    },
});

const appElement = document.getElementById('app');

const routeComponent = () => {
    if (window.location.pathname === '/signup') {
        return React.createElement(Signup);
    }

    if (
        window.location.pathname === '/main'
        || window.location.pathname === '/'
        || window.location.pathname === '/dashboard'
        || window.location.pathname === '/attendance'
        || window.location.pathname === '/employees'
        || window.location.pathname === '/tasks/new'
        || window.location.pathname === '/tasks'
    ) {
        return React.createElement(Main);
    }

    if (window.location.pathname === '/setting') {
        return React.createElement(SettingPage);
    }

    return React.createElement(Login);
};

if (appElement) {
    createRoot(appElement).render(
        React.createElement(
            ThemeProvider,
            { theme },
            React.createElement(
                AuthProvider,
                null,
                React.createElement(CssBaseline),
                routeComponent(),
            ),
        ),
    );
}
