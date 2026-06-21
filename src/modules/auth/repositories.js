import user from "./model.js";

class authRepository {
  async findByFieldName(field) {
    let data = await user.findOne({ ...field, isDeleted: false });
    return data;
  }

  async userCreate(data) {
    let datas = await user.create(data);
    return datas;
  }

  async getUser(email) {
    let data = await user.findOne({ email: email, isDeleted: false });
    return data;
  }

  async getUserById(id) {
    let datas = await user.findById(id);
    return datas;
  }

  async updateVerificationStatus(userId, status) {
    let data = await user.findByIdAndUpdate(userId, { isVerified: status }, { new: true });
    return data;
  }

  async updatePassword(email, hashedPassword) {
    let data = await user.findOneAndUpdate({ email: email }, { password: hashedPassword }, { new: true });
    return data;
  }

  async updateUser(id, data) {
    console.log(data, 'LOGGG');
    let datas = await user.findByIdAndUpdate(id, data, { new: true });
    return datas;
  }
}

export default new authRepository();
