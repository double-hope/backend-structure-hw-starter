export const returnError = (res, status, err) => {
    return res.status(status).send({ error: err });
}