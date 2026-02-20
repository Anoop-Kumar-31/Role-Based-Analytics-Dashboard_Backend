const { Item86 } = require("../models");

const createItem86 = async (data, transaction) => {
    return await Item86.create(data, { transaction });
};

module.exports = {
    createItem86,
};
