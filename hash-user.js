const bcrypt = require('bcrypt');

const plainPassword = 'adminisboss';
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds).then(hash => {
  console.log("Hashed password:", hash);
});
