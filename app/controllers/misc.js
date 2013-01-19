var config = require("../../config/config.js");
exports.home = function(req, res) {
    res.sendfile(config.root + "/public/view1.html");
}
exports.demo = function(req, res) {
    res.sendfile(config.root + "/public/demo.html");
}
