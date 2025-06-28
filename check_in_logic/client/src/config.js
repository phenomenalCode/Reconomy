// // config.js or wherever you export these
// export const baseUrl = "https://reconomy.herokuapp.com/api/employees";  // backend API URL on Heroku
// export const adminUrl = "https://reconomy.herokuapp.com";              // admin login backend on Heroku
const isLocal = window.location.hostname === "localhost";

export const baseUrl = isLocal
  ? "http://localhost:8081/api/employees"
  : "https://reconomy-e41aeb0af072.herokuapp.com/api/employees";

export const adminUrl = isLocal
  ? "http://localhost:8081"
  : "https://reconomy-e41aeb0af072.herokuapp.com";
