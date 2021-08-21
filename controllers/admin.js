const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const errorHandler = require("../utils/errorHandler")
const App = require("../models/App")

async function login(req, res) {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    const { username, password } = req.body
    const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(404).json({ message: "Wrong username or password" })
    }

    const token = jwt.sign(
      { name: "admin", role: "admin" },
      process.env.jwtPrivateKey
    )
    res.status(200).send(token)
  } catch (error) {
    res.status(400).send(error.message)
  }
}
async function totalMoney(req, res) {
  try {
    const apps = await App.find({ isFree: false })
    const sum = apps.reduce((total, { price, downloaded_by }) => {
      if (downloaded_by.length === 0) return total
      return (total + price) * downloaded_by.length
    }, 0)

    res.status(200).json((sum / 100) * 40)
  } catch (e) {
    errorHandler(res, e)
  }
}
module.exports = { login, totalMoney }
