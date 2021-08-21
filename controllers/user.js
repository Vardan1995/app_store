const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")
const errorHandler = require("../utils/errorHandler")
const User = require("../models/User")
const App = require("../models/App")

async function register(req, res) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  const { username, password } = req.body
  console.log(req.body)

  try {
    const candidate = await User.findOne({ username })

    if (candidate) {
      return res.status(409).json({ message: "User exists, please login" })
    }

    const user = new User({
      username,
      password,
    })

    await user.save()

    res.status(201).json({ message: "User created" })
  } catch (e) {
    errorHandler(res, e)
  }
}
async function login(req, res) {
  try {
    const { username, password } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    let user = await User.findOne({ username })

    if (!user)
      return res.status(404).json({ message: "Wrong username or password" })

    bcrypt.compare(password, user.password, function (error, result) {
      if (error) throw error
      if (result) {
        const token = user.generateAuthToken()
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
async function installApp(req, res) {
  try {
    const { _id } = req.user
    const { appId } = req.params
    let app = await App.findOne({ _id: appId })
    let user = await User.findOne({ _id })
    if (!app) return res.status(404).json({ message: "App does not exist" })

    if (!app.downloaded_by.includes(_id)) {
      app.downloaded_by.push(_id)
    }
    await app.save()

    if (!user.installed_apps.includes(appId)) {
      user.installed_apps.push(appId)
    }
    await user.save()
    res.status(200).json({ message: "App has been downloaded successfully" })
  } catch (error) {
    res.status(400).send(error.message)
  }
}
async function unInstallApp(req, res) {
  const { _id } = req.user
  const { appId } = req.params

  try {
    await User.updateOne(
      { _id, installed_apps: { $in: [appId] } },
      {
        $pullAll: { installed_apps: [appId] },
      }
    )

    res.status(200).json({ message: "App uninstalled successfully" })
  } catch (error) {
    res.status(400).send(error.message)
  }
}
async function getApps(req, res) {
  const { _id } = req.user

  try {
    let apps = await App.find({}).select(
      "icon name brief_description downloaded_by"
    )

    res.status(200).json(apps)
  } catch (error) {
    res.status(400).send(error.message)
  }
}
async function getApp(req, res) {
  try {
    const { _id } = req.user
    const { appId } = req.params
    let apps = await App.findOne({ _id: appId }).populate(
      "company",
      "username website_url"
    )

    res.status(200).json(apps)
  } catch (error) {
    res.status(400).send(error.message)
  }
}

async function getInstalledApps(req, res) {
  try {
    const { _id } = req.user
    let apps = await User.findOne({ _id })
      .populate("installed_apps", "name price")
      .select("installed_apps")

    res.status(200).json({ installed_apps: apps.installed_apps })
  } catch (error) {
    res.status(400).send(error.message)
  }
}
module.exports = {
  register,
  login,
  installApp,
  unInstallApp,
  getApps,
  getApp,
  getInstalledApps,
}
