const loginDb = require('../models/login_model');

exports.logIn = async function (req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Missing username or password" });
    }

    const user = await loginDb.logIn(username, password);

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    console.log("User logged in successfully:", user);

    // TODO: Set session or issue JWT token here if applicable
    // e.g. req.session.user = user; or generate JWT token and send

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Unhandled login error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
};

// Session-based logout
exports.logOut = function (req, res) {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Failed to log out" });
      }
      // Clear cookie if needed (adjust cookie name)
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: "Successfully logged out" });
    });
  } else {
    res.status(400).json({ error: "No active session found" });
  }
};

// JWT-based logout (optional if you implement token blacklisting)
exports.logOutWithJWT = async function (req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "No token provided" });
    }

    // Implement token blacklist logic in your model if needed
    await loginDb.blacklistToken(token);

    res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

exports.updateLogin = function (req, res) {
  res.status(200).json({ message: "Update login not implemented yet" });
};

exports.deleteLogin = function (req, res) {
  res.status(200).json({ message: "Delete login not implemented yet" });
};
