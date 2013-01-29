var express = require('express')
, flash = require('connect-flash');
module.exports = function(app, config) {
    app.set('showStackError', true);
    app.use(express.static(config.root+'/public'));
    app.use(express.logger('dev'));
    app.set('views', config.root+'/app/views');
    app.set('view engine', 'jade');

    app.configure(function() {
        app.use(express.cookieParser());
        app.use(express.session({ cookie: { maxAge: 60000 }}));
        app.use(flash());
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(express.favicon());
        app.use(app.router);
        app.use(function(err, req, res, next){
            // treat as 404
            if (~err.message.indexOf('not found')) return next()

            // log it
            console.error(err.stack)

            // error page
            res.status(500).render('500', { error: err.stack })
        })

        // assume 404 since no middleware responded
        app.use(function(req, res, next){
            res.status(404).render('404', { url: req.originalUrl })
        });
    });
}
