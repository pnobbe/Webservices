module.exports = function(app){
    app.use(function(req, res, next) {
        return req.headers.host;
    });
};