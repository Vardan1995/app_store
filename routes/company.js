const express = require("express")
const router = express.Router()

const controller = require("../controllers/company")

router.post("/create_app", controller.createApp)
router.delete("/delete_app/:appId", controller.deleteApp)
router.get("/income", controller.recivedMoney)

module.exports = router
