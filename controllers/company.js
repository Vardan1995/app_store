const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const errorHandler = require("../utils/errorHandler")
const Company = require("../models/Company")
const App = require("../models/App")

async function register(req, res) {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { username, password, website_url } = req.body
    const candidate = await Company.findOne({ username })

    if (candidate) {
      return res.status(409).json({ message: "Company exists, please login" })
    }

    const company = new Company({
      username,
      password,
      website_url,
    })

    await company.save()

    res.status(201).json({ message: "Company created" })
  } catch (e) {
    errorHandler(res, e)
  }
}

async function login(req, res) {
  const { username, password } = req.body

  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }
    let company = await Company.findOne({ username })

    if (!company)
      return res.status(404).json({ message: "Wrong username or password" })

    bcrypt.compare(password, company.password, function (error, result) {
      if (error) throw error
      if (result) {
        const token = company.generateAuthToken()
        res.status(200).json({ token })
      } else {
        return res.status(404).json({ message: "Wrong username or password" })
      }
    })
  } catch (error) {
    console.log("Failed in login", error)
    res.status(400).send(error.message)
  }
}

async function createApp(req, res) {
  const { name, icon, brief_description, long_description, price } = req.body
  const { _id } = req.user
  try {
    const candidate = await App.findOne({ name })

    if (candidate) {
      return res.status(409).json({ message: "App exists" })
    }

    const app = new App({
      company: _id,
      name,
      icon,
      brief_description,
      long_description,
      price,
    })

    await app.save()

    res.status(201).json({ message: "App created" })
  } catch (e) {
    errorHandler(res, e)
  }
}

async function deleteApp(req, res) {
  const { appId } = req.params
  try {
    const app = await App.findOne({ _id: appId, company: req.user._id })
    if (!app)
      return res
        .status(404)
        .json({ message: "you have no permissions to delete this app" })
    await app.remove()
    res.status(200).json({ message: "App has been deleted successfully" })
  } catch (e) {
    errorHandler(res, e)
  }
}

async function getApps_(req, res) {
  const { _id } = req.user
  try {
    const apps = await App.find({ company: _id })

    res.status(200).json(apps)
  } catch (e) {
    errorHandler(res, e)
  }
}
async function recivedMoney(req, res) {
  const { _id } = req.user
  try {
    const apps = await App.find({ company: _id, isFree: false })
    const sum = apps.reduce((total, { price, downloaded_by }) => {
      if (downloaded_by.length === 0) return total
      return (total + price) * downloaded_by.length
    }, 0)

    res.status(200).json((sum / 100) * 60)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports = { register, login, createApp, recivedMoney, deleteApp }
