import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

export const getAddressController = async (req, res) => {
    try {
        const userId = req.userId
        const data = await AddressModel.find({userId: userId})
            .sort({createdAt: -1})

        return res.json({
            success: true,
            data: data,
            message: "List of address",
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
        const {address_line, city, state, pinCode, country, mobile} = req.body

        const createAddress = new AddressModel({
            address_line,
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
                address_details: saveAddress._id
            }
        })

        return res.json({
            success: true,
            message: "Address Created Successfully",
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
        const {_id, address_line, city, state, country, pinCode, mobile} = req.body

        await AddressModel.updateOne({_id: _id, userId: userId}, {
            address_line,
            city,
            state,
            country,
            mobile,
            pinCode
        })

        return res.json({
            success: true,
            message: "Address Updated",
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
            message: "Address remove",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

