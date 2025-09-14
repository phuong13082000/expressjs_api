import bcryptjs from "bcryptjs";

class Password {
    static async hash(password) {
        const salt = await bcryptjs.genSalt(10);
        return await bcryptjs.hash(password, salt);
    }

    static async check(password, userPassword) {
        return await bcryptjs.compare(password, userPassword);
    }
}

export default Password;
