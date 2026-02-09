import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if port is different
});

export default instance;
