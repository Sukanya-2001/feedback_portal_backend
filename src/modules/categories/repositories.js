import Category from "./model.js";

class CategoryRepository {
  async save(data) {
    let savedData = await Category.create(data);
    return savedData;
  }

  async findAll() {
    let findData = await Category.find({ isDeleted: false });
    return findData;
  }

  async update(id, data) {
    let updatedData = await Category.findByIdAndUpdate(id, data, { new: true });
    return updatedData;
  }

  async delete(id) {
    let deletedData = await Category.findByIdAndUpdate(id, { isDeleted: true });
    return deletedData;
  }

  async findById(id) {
    let findData = await Category.findOne({
      _id: id,
      isDeleted: false,
    });
    return findData;
  }
}

export default new CategoryRepository();
