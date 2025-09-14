import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";
import {BaseController} from "./base.controller.js";

class AddressController extends BaseController {
    static async get(req, res) {
        try {
            const userId = req.userId
            const data = await AddressModel.find({userId: userId})
                .select("-userId -createdAt -updatedAt -__v")
                .sort({createdAt: -1})

            return this.success(res, data);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async add(req, res) {
        try {
            const userId = req.userId
            const {addressLine, city, state, pinCode, country, mobile} = req.body

            const createAddress = new AddressModel({
                addressLine,
                city,
                state,
                country,
                pinCode,
                mobile,
                userId: userId
            })

            const saveAddress = await createAddress.save()

            await UserModel.findByIdAndUpdate(userId, {
                $push: {
                    addressDetails: saveAddress._id
                }
            })

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async update(req, res) {
        try {
            const userId = req.userId
            const {id, addressLine, city, state, country, pinCode, mobile} = req.body

            await AddressModel.updateOne({_id: id, userId: userId}, {
                addressLine,
                city,
                state,
                country,
                mobile,
                pinCode
            })

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async delete(req, res) {
        try {
            const userId = req.userId
            const {_id} = req.body

            await AddressModel.updateOne({_id: _id, userId}, {status: false})

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }
}

export default new AddressController();
