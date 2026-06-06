import About from "./model.js";

class aboutRepository {
  async create(data) {
    try {
      let data = await About.create(data);
      return data;
    } catch (err) {
      throw err;
    }
  }
}

export default new aboutRepository();
