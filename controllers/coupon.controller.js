import CouponModel from "../models/coupon.model.js";

export class CouponController {
    static async get(req, res) {
        try {
            const data = await CouponModel.find()
                .select("-createdAt -updatedAt -__v");

            return res.json({
                success: true,
                data: data,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async create(req, res) {
        const {code, discountType, discountValue, minOrderValue, usageLimit, expiresAt} = req.body;

        try {
            const createCoupon = new CouponModel({
                code,
                discountType,
                discountValue,
                minOrderValue,
                usageLimit,
                expiresAt,
            })

            await createCoupon.save();

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async update(req, res) {
        const {id} = req.params;
        const {code, discountType, discountValue, minOrderValue, usageLimit, expiresAt} = req.body;

        try {
            await CouponModel.updateOne({_id: id}, {
                code,
                discountType,
                discountValue,
                minOrderValue,
                usageLimit,
                expiresAt,
            })

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async delete(req, res) {
        const {id} = req.params;

        try {
            await CouponModel.deleteOne({_id: id});

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async use(req, res) {
        try {
            const {code, orderValue} = req.body;

            const coupon = await CouponModel.findOne({code: code.toUpperCase()});

            if (!coupon) {
                return res.status(404).json({
                    status: false,
                    message: "Coupon not found"
                });
            }

            if (coupon.expiresAt < new Date()) {
                return res.status(400).json({
                    status: false,
                    message: "Coupon expired"
                });
            }

            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({
                    status: false,
                    message: "Coupon has run out of uses"
                });
            }

            if (orderValue < coupon.minOrderValue) {
                return res.status(400).json({
                    status: false,
                    message: "The order has not reached the minimum value"
                });
            }

            let discount = 0;

            if (coupon.discountType === "percent") {
                discount = (orderValue * coupon.discountValue) / 100;
            } else {
                discount = coupon.discountValue;
            }

            if (discount > orderValue) {
                discount = orderValue;
            }

            return res.json({
                success: true,
                data: {
                    discount: discount,
                    finalPrice: orderValue - discount,
                    coupon: coupon.code,
                },
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }
}
