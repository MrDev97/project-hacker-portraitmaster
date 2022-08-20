const validateEmail = (email) => {
  let re = /\S+@\S+\.\S+/;
  return re.test(email);
};

module.exports = validateEmail;
