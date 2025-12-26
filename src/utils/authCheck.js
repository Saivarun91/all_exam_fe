/**
 * Check if user is authenticated and has a valid token
 */
export function checkAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  if (!token) {
    console.error("No token found. Please log in.");
    return false;
  }
  
  if (role !== "admin") {
    console.error("User is not an admin. Current role:", role);
    return false;
  }
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    if (currentTime >= expirationTime) {
      console.error("Token has expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Invalid token format:", error);
    return false;
  }
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token || ""}`
  };
}

/**
 * Get auth headers for file upload requests (without Content-Type)
 * The browser will automatically set Content-Type to multipart/form-data
 */
export function getAuthHeadersForUpload() {
  const token = localStorage.getItem("token");
  
  return {
    "Authorization": `Bearer ${token || ""}`
  };
}

