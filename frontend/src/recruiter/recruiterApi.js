import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const RECRUITER_TOKEN_KEY = "hireme_recruiter_token";

const recruiterApi = axios.create({ baseURL: `${BACKEND_URL}/api` });

recruiterApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(RECRUITER_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const setRecruiterToken = (t) => localStorage.setItem(RECRUITER_TOKEN_KEY, t);
export const getRecruiterToken = () => localStorage.getItem(RECRUITER_TOKEN_KEY);
export const clearRecruiterToken = () => localStorage.removeItem(RECRUITER_TOKEN_KEY);

export const REC_IMAGES = {
  hero: "https://static.prod-images.emergentagent.com/jobs/9c4e3c0f-821d-4c0c-8199-61ca4b890cda/images/7efd9ad80cd68c2ca7115fb9616505412037d041cd9b3315cbca58a0f74f944d.jpeg",
  payroll: "https://static.prod-images.emergentagent.com/jobs/9c4e3c0f-821d-4c0c-8199-61ca4b890cda/images/1d741fb3d6915b0126e3d979ec5f7b03c1eb627856354af0069a6500d7033226.jpeg",
  talent: "https://static.prod-images.emergentagent.com/jobs/9c4e3c0f-821d-4c0c-8199-61ca4b890cda/images/84b5f348187587e39bd87f316b9503c0d8c16d1f1f4740ac3dcf66d1cbb79a8c.jpeg",
  jobpost: "https://static.prod-images.emergentagent.com/jobs/9c4e3c0f-821d-4c0c-8199-61ca4b890cda/images/a2e7e65fb9bb2bb80d2428f20c096855c1b2cc7ed367979b19c5e01282a6c365.jpeg",
  ads: "https://static.prod-images.emergentagent.com/jobs/9c4e3c0f-821d-4c0c-8199-61ca4b890cda/images/a4d8e39d505baaa053b414d8e5626c9566860f4a6a814533f3a2c38241756079.jpeg",
};

export default recruiterApi;
