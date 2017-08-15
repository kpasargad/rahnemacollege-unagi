var crypto = require("crypto"),
    algorithm = "aes-256-ctr",
    secret = require("../../config").hashsecret;

exports.encrypt = function(req, res, id, callback) {
    var text = req.body.password + req.body.email;
    var cipher = crypto.createCipher(algorithm, secret);
    var crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    callback(req, res, id, crypted);
};
