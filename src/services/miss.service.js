const { Miss } = require("../models");

const createMiss = async (data, transaction) => {
    return await Miss.create(data, { transaction });
};

module.exports = {
    createMiss,
};
