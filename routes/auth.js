const express = require("express")
const router = express.Router()

const adminController = require("../controllers/admin")
const userController = require("../controllers/user")
const companyController = require("../controllers/company")

router.post("/admin/login", adminController.login)
router.post("/user/register", userController.register)
router.post("/user/login", userController.login)
router.post("/company/register", companyController.register)
router.post("/company/login", companyController.login)

module.exports = router
