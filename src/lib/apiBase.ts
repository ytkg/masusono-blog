const DEV_API_BASE = "http://localhost:3000"
const PROD_API_BASE = "https://api.masusono.com"

export const API_BASE = import.meta.env.DEV ? DEV_API_BASE : PROD_API_BASE
