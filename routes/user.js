const express = require("express")
const controller = require("../controllers/user")

const router = express.Router()

router.get("/apps", controller.getApps)
router.get("/apps/:appId", controller.getApp)
router.get("/installed_apps", controller.getInstalledApps)
router.post("/install/:appId", controller.installApp)
router.put("/uninstall/:appId", controller.unInstallApp)

module.exports = router
