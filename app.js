const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const mongoose = require("mongoose")

require("dotenv").config()
const app = express()

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost/app_store", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => {
    console.error("FATAL ERROR: Could not connect to MongoDB...")
    process.exit(1)
  })

if (!process.env.jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.")
  process.exit(1)
}

const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")
const userRoutes = require("./routes/user")
const companyRoutes = require("./routes/company")
const auth = require("./middlewares/auth")
const adminAuth = require("./middlewares/auth")
const companyAuth = require("./middlewares/auth")
const { validate } = require("./middlewares/validators")

app.use(morgan("dev"))
app.use(express.json())

app.use(cors())

app.use("/api/auth", validate, authRoutes)
app.use("/api/user", auth, userRoutes)
app.use("/api/admin", [auth, adminAuth], adminRoutes)
app.use("/api/company", [auth, companyAuth], companyRoutes)

app.use((req, res, next) => {
  res.status(404).redirect("Page not found!")
  next()
})

app.disable("x-powered-by")

module.exports = app
