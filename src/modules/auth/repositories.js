import user from './model.js';

class authRepository {

    async findByFieldName (field) {
        let data = await user.findOne(field);
        return data;
    }

    async userCreate (data) {
        let datas = await user.create(data);
        return datas;
    }

    async getUser (email) {
        let data = await user.findOne({email: email});
        return data;
    }

    async getUserById (id) {
        let datas = await user.findById(id);
        return datas;
    }


}

export default new authRepository();