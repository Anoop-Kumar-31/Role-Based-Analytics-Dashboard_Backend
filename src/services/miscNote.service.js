const { MiscNote } = require("../models");

const createMiscNote = async (data, transaction) => {
    return await MiscNote.create(data, { transaction });
};

module.exports = {
    createMiscNote,
};
