import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://wealthrun-wealthrun.up.railway.app";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ensures cookies/tokens flow across domains
});

export default api;
