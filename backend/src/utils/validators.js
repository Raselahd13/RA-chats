const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
  return regex.test(password);
};

const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscore only
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

const validatePhoneNumber = (phone) => {
  // Basic international phone validation
  const regex = /^\+?[1-9]\d{1,14}$/;
  return regex.test(phone);
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber
};