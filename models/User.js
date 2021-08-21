const { Schema, model, ObjectId } = require("mongoose")
const bcrypt = require("bcryptjs")
const generateAuthToken = require("../utils/generateAuthToken")
const userSchema = new Schema(
  {
    username: String,
    password: String,
    money_spend: {
      type: Number,
      defult: 0,
    },
    installed_apps: [{ type: ObjectId, ref: "App" }],
    role: {
      type: String,
      defult: "user",
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

userSchema.pre("save", async function (next) {
  this.role = "user"
  try {
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

userSchema.pre("updateOne", async function (next) {
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
userSchema.methods.generateAuthToken = generateAuthToken

userSchema.methods.validPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = model("User", userSchema)
