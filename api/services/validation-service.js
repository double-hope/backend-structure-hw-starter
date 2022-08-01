import { returnError } from './return-error';

const checkValidation = (schema, body, res) => {
    const isValidResult = schema.validate(body);

    if(isValidResult.error)
        returnError(res, 400, isValidResult.error.details[0].message);
}

export { checkValidation };