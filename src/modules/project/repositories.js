import project from "./model.js";

class projectRepository {
  async create(data) {
    let saveData = await project.create(data);
    return saveData;
  }

  async getAll() {
    let allData = await project.find();
    return allData;
  }

  async getById(id) {
    let getData = await project.findById(id);
    return getData;
  }

  async update(id, data) {
    let updatedData = await project.findByIdAndUpdate(id, data, { new: true });
    return updatedData;
  }

  async deleteById(id) {
    let findData = await project.findByIdAndUpdate(id, { isDeleted: true });
    return findData;
  }
}

export default new projectRepository();
