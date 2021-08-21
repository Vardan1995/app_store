const { Schema, model, Types } = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new Schema(
  {
    company: {
      ref: "Company",
      type: Types.ObjectId,
    },
    name: String,
    icon: String,
    brief_description: String,
    long_description: String,
    price: Number,
    isFree: {
      type: Boolean,
      default: true,
    },
    downloaded_by: {
      type: Array,
      defult: [],
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
  try {
    if (this.price > 0) {
      this.isFree = false
    }
    next()
  } catch (e) {
    next(e)
  }
})

userSchema.pre("updateOne", async function (next) {
  try {
    if (!this.isModified("price")) {
      next()
    }
    if (this.price > 0) {
      this.isFree = false
    }
    next()
  } catch (e) {
    next(e)
  }
})

module.exports = model("App", userSchema)
