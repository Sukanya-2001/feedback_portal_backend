import Catgory from "./Models";

class CategoryRepository {
  async save(data) {
    let savedData = await Catgory.create(data);
    return savedData;
  }

  async findAll() {
    let findData = await Catgory.find({ isDeleted: false });
    return findData;
  }

  async update(id, data) {
    let updatedData = await Catgory.findByIdAndUpdate(id, data, { new: true });
    return updatedData;
  }

  async delete(id) {
    let deletedData = await Catgory.findByIdAndUpdate(id, { isDeleted: true });
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
