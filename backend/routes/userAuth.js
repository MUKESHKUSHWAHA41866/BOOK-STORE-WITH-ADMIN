/**
 * Legacy re-export shim — keeps old require('./userAuth') working
 * so any file that wasn't updated yet doesn't break.
 */
module.exports = require("../middlewares/auth.middleware");