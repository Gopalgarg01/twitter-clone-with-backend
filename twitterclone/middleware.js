exports.requireLogin = (req, res , next) => {
    if(req.session && req.session.user){   // if the request session exits it will directly get login
        return next();
    }
    else{
        return res.redirect('/login');
    }
}
