import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://job-card-enin.vercel.app/api', // Adjust if port is different
});

export default instance;
