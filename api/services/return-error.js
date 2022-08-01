export const returnNotAuthError = (res, err) => {
    return res.status(401).send({ error: err });
}