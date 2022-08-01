const checkValidation = (schema, body, status) => {
    const isValidResult = schema.validate(body);

    if(isValidResult.error) {
        status(400).send({ error: isValidResult.error.details[0].message });
    }
}

export { checkValidation };