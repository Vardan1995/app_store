const { Schema, model } = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const generateAuthToken = require("../utils/generateAuthToken")

const companySchema = new Schema(
  {
    username: String,
    password: String,
    website_url: String,
    role: {
      type: String,
      defult: "dev",
    },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
)

companySchema.pre("save", async function (next) {
  try {
    this.role = "dev"
    if (!this.isModified("password")) {
      next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (e) {
    next(e)
  }
})

companySchema.pre("updateOne", async function (next) {
  try {
    if (!this._update.password) {
      next()
    }

    const salt = await bcrypt.genSalt(10)
    this._update.password = await bcrypt.hash(this._update.password, salt)
    next()
  } catch (e) {
    next(e)
  }
})

companySchema.methods.validPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (err) {
    throw new Error(err)
  }
}
companySchema.methods.generateAuthToken = generateAuthToken

module.exports = model("Company", companySchema)
