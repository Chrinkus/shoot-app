function generateID(date, type) {
    // generate a unique, sortable ID based on event information

    return `${getDateStr(date)}-${type.toLowerCase()}`;
}

function getDateStr(date) {
    // extract a consistent date string out of a user date string
    const d = new Date(date);

    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export { generateID as default };
/*
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateID,
        getDateStr
    };
}
*/
