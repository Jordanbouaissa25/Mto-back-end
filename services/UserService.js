const User = require('../models/User');

class UserService {
  static async addOneUser(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  static async findUserByEmail(email) {
    return User.findOne({ email });
  }

  static async updateUserPassword(email, newPassword) {
    const user = await User.findOne({ email });
    if (user) {
      user.password = newPassword;
      await user.save();
      return user;
    }
    return null;
  }
}

module.exports = UserService;
