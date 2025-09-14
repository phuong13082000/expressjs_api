import CouponModel from "../models/coupon.model.js";
import UserModel from "../models/user.model.js";
import {BaseController} from "./base.controller.js";

class CouponController extends BaseController {
    static async get(req, res) {
        try {
            const data = await CouponModel.find()
                .select('-createdAt -updatedAt -__v')
                .populate({
                    path: 'usedBy',
                    select: 'name email',
                })

            return this.success(res, data);
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async create(req, res) {
        try {
            const {code, discountType, discountValue, minOrderValue, usageLimit, expiresAt} = req.body;

            const createCoupon = new CouponModel({
                code,
                discountType,
                discountValue,
                minOrderValue,
                usageLimit,
                expiresAt,
            })

            await createCoupon.save();

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async update(req, res) {
        try {
            const {id} = req.params;
            const {code, discountType, discountValue, minOrderValue, usageLimit, expiresAt} = req.body;

            await CouponModel.updateOne({_id: id}, {
                code,
                discountType,
                discountValue,
                minOrderValue,
                usageLimit,
                expiresAt,
            })

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async delete(req, res) {
        const {id} = req.params;

        try {
            await CouponModel.deleteOne({_id: id});

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }

    static async use(req, res) {
        try {
            const userId = req.userId
            const {code, orderValue} = req.body;

            const coupon = await CouponModel.findOne({code: code.toUpperCase()});

            if (!coupon) {
                return this.error(res, 'coupon not found')
            }

            if (coupon.expiresAt < new Date()) {
                return this.error(res, 'coupon expired')
            }

            if (coupon.usedCount >= coupon.usageLimit) {
                return this.error(res, 'coupon has run out of uses')
            }

            if (orderValue < coupon.minOrderValue) {
                return this.error(res, 'the order has not reached the minimum value')
            }

            if (coupon.usedBy.includes(userId)) {
                return this.error(res, 'coupon used')
            }

            let discount;

            if (coupon.discountType === "percent") {
                discount = (orderValue * coupon.discountValue) / 100;
            } else {
                discount = coupon.discountValue;
            }

            if (discount > orderValue) {
                discount = orderValue;
            }

            coupon.usageLimit -= 1;
            coupon.usedCount += 1;
            coupon.usedBy.push(userId);

            await coupon.save()

            await UserModel.findByIdAndUpdate(
                userId,
                {$addToSet: {usedCoupons: coupon._id}},
                {new: true}
            );

            return this.success(res, {
                discount: discount,
                finalPrice: orderValue - discount,
            });
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }
}

export default new CouponController();
