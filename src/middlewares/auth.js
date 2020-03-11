const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("./../models/user");
const { Op } = require("sequelize");

const publicKeyPath = path.join(__dirname, "../keys/public.key");
const pulbicKey = fs.readFileSync(publicKeyPath, "utf-8");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, pulbicKey, { algorithms: "RS256" });

    const user = await User.findOne({
      where: {
        username: decoded.username,
        tokens: {
          [Op.contains]: [token]
        }
      }
    });

    if (!user) {
        throw new Error()
    }

    req.token = token
    req.user = user.toJSON()
    next();
  } catch (e) {
      res.status(401).send({'error': 'Please authenticate'})
  }
};

module.exports = auth;
