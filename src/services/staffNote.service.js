const { StaffNote } = require("../models");

const createStaffNote = async (data, transaction) => {
    return await StaffNote.create(data, { transaction });
};

module.exports = {
    createStaffNote,
};
