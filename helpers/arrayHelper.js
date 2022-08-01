export const changeArrayElems = (array, key) => {
    const index = key.indexOf('_');
    let newKey = key.replace('_', '');
    newKey = newKey.split('')
    newKey[index] = newKey[index].toUpperCase();
    newKey = newKey.join('');
    array[newKey] = array[key];
    delete array[key];
    return array;
}