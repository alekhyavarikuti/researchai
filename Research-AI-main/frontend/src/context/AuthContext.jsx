import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, register as registerApi, getCurrentUser, logout as logoutApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await getCurrentUser();
                    setUser(data);
                } catch (error) {
                    console.error("Failed to load user", error);
                    
                    if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 422)) {
                        localStorage.removeItem('token');
                    }
                }
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    const login = async (email, password) => {
        const { data } = await loginApi(email, password);
        localStorage.setItem('token', data.access_token);
        setUser(data.user);
        return data;
    };

    const register = async (username, email, password) => {
        return await registerApi(username, email, password);
    };

    const logout = () => {
        logoutApi();
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
