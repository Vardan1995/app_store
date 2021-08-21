const jwt = require("jsonwebtoken")

module.exports = function () {
  const token = jwt.sign(
    { _id: this._id, name: this.username, role: this.role },
    process.env.jwtPrivateKey
  )
  return token
}
