const db = require('../db/db_mysql.js'); // must be using .promise()
const bcrypt = require('bcrypt');

exports.logIn = async function (userName, password) {
  console.log("@login model logIn");

  const query = `
    SELECT 
      id AS employee_id, 
      username AS user_name, 
      password, 
      is_admin AS isAdmin 
    FROM users 
    WHERE username = ?
  `;

  try {
    const [results] = await db.query(query, [userName]);

    if (!results.length) {
      console.warn("No user found with username:", userName);
      return null;
    }

    const user = results[0];

    if (!user.password) {
      console.error("Password is null/undefined in DB");
      throw new Error("Invalid user data");
    }

    const match = await bcrypt.compare(password, user.password);

    if (match) {
      console.log("Password matched successfully.");
      return user;
    } else {
      console.warn("Incorrect password for user:", userName);
      return null;
    }
  } catch (err) {
    console.error("DB query error:", err);
    throw err;
  }
};
