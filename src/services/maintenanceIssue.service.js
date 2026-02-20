const { MaintenanceIssue } = require("../models");

const createMaintenanceIssue = async (data, transaction) => {
    return await MaintenanceIssue.create(data, { transaction });
};

module.exports = {
    createMaintenanceIssue,
};
