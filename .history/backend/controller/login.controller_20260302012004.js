require("dotenv").config();
const dbService = require("../services/db.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Customers = require("../model/customer.model");

const loginFunc = async (req, res, schema) => {
  try {
    const { email, password } = req.body;

    const user = await dbService.findOneRecord({ email }, schema);

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials!",
        isLoged: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials!",
        isLoged: false,
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "You are not active member!",
        isLoged: false,
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    let payload = {
      ...userObj,
      _id: user._id.toString(),
    };

    // 🔥 CHỈ customer mới query bảng Customers
    if (userObj.userType === "customer") {
      const customer = await Customers.findOne({
        customerLoginId: user._id.toString(),
      });

      payload.accountNo = customer?.accountNo || null;
      payload.bankCardNo = customer?.bankCardNo || null;
      payload.currency = customer?.currency || null;
      payload.finalBalance = customer?.finalBalance || 0;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });

    return res.status(200).json({
      message: "Login successful!",
      isLoged: true,
      token,
      userType: userObj.userType,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      isLoged: false,
      error: error.message,
    });
  }
};

module.exports = {
  loginFunc,
};
