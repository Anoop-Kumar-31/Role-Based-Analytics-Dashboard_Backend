const { Win } = require("../models");

const createWin = async (data, transaction) => {
    return await Win.create(data, { transaction });
};

module.exports = {
    createWin,
};
