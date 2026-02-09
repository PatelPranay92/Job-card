// Utility functions for user authentication and role management

export const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const isAdmin = () => {
    const user = getUser();
    return user && user.role === 'Admin';
};

export const isUser = () => {
    const user = getUser();
    return user && user.role === 'User';
};

export const hasRole = (role) => {
    const user = getUser();
    return user && user.role === role;
};

export const canDelete = () => {
    return isAdmin();
};

export const canCreate = () => {
    return isAdmin();
};

export const canEdit = () => {
        
    return true;
};

export const canView = () => {
    // Both Admin and User can view
    return true;
};
