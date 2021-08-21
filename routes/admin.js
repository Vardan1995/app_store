const express = require("express")
const controller = require("../controllers/admin")

const router = express.Router()

router.get("/income", controller.totalMoney)

module.exports = router
