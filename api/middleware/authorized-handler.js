export const checkAuthorized = (req, res, next) => {
    let token = req.headers['authorization'];
    (!token)
        ? req.authorize = false
        :req.authorize = true;
    next();
}