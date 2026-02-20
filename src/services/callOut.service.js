const { CallOut } = require("../models");

const createCallOut = async (data, transaction) => {
    return await CallOut.create(data, { transaction });
};

module.exports = {
    createCallOut,
};
