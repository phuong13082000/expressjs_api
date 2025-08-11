import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const getAddressController = async (req, res) => {
    try {
        const userId = req.userId
        const data = await AddressModel.find({userId: userId})
            .select("-userId -createdAt -updatedAt")
            .sort({createdAt: -1})

        return res.json({
            success: true,
            data: data,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const addAddressController = async (req, res) => {
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

        return res.json({
            success: true,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const updateAddressController = async (req, res) => {
    try {
        const userId = req.userId
        const {_id, addressLine, city, state, country, pinCode, mobile} = req.body

        await AddressModel.updateOne({_id: _id, userId: userId}, {
            addressLine,
            city,
            state,
            country,
            mobile,
            pinCode
        })

        return res.json({
            success: true,
            message: "",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export const deleteAddressController = async (req, res) => {
    try {
        const userId = req.userId
        const {_id} = req.body

        await AddressModel.updateOne({_id: _id, userId}, {status: false})

        return res.json({
            success: true,
            message: "",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

