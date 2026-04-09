import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8082/api' });


export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);


export const getUser = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);


export const getDietRecords = (userId) => API.get(`/diet-records?userId=${userId}`);
export const createDietRecord = (data) => API.post('/diet-records', data);
export const updateDietRecord = (id, data) => API.put(`/diet-records/${id}`, data);
export const deleteDietRecord = (id) => API.delete(`/diet-records/${id}`);


export const getDietPlan = (userId) => API.get(`/diet-plan/${userId}`);
export const getWeeklyDietPlan = (userId) => API.get(`/diet-plan/${userId}/weekly`);


export const getWaterLogs = (userId, date) => API.get(`/water-logs?userId=${userId}${date ? `&date=${date}` : ''}`);
export const createWaterLog = (data) => API.post('/water-logs', data);


export const getRoutines = (userId) => API.get(`/routines?userId=${userId}`);
export const createRoutine = (data) => API.post('/routines', data);
export const deleteRoutine = (id) => API.delete(`/routines/${id}`);

export default API;