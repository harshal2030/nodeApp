const fs = require('fs');
const path = require('path')
const jwt = require('jsonwebtoken')
const User = require('./../models/user');
const {Op, QueryTypes} = require('sequelize')
const sequelize = require('./../db/index')

const publicKeyPath = path.join(__dirname, '../keys/public.key');
const pulbicKey = fs.readFileSync(publicKeyPath, 'utf-8');

const auth = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log(token)
    console.log()
    const decoded = jwt.verify(token, pulbicKey, {algorithms: 'RS256'})
    console.log(decoded)

    const user = await User.findOne({
        where: {
            username: decoded.username,
            tokens: {
                [Op.contains]: [token]
            }
        }
    })

    console.log(user.toJSON());

    next()
}

module.exports = auth;