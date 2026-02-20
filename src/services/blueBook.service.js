const { BlueBook, Item86, MiscNote, StaffNote, CallOut, MaintenanceIssue, Miss, Win, sequelize, Restaurant, User } = require("../models");
const item86Service = require("./item86.service");
const miscNoteService = require("./miscNote.service");
const staffNoteService = require("./staffNote.service");
const callOutService = require("./callOut.service");
const maintenanceIssueService = require("./maintenanceIssue.service");
const missService = require("./miss.service");
const winService = require("./win.service");

/**
 * Create a new BlueBook entry
 * @param {Object} data - BlueBook data
 * @returns {Promise<Object>} Created BlueBook entry
 */
const createBlueBook = async (data) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            item86s = [],
            miscNotes = [],
            staffNotes = [],
            callOuts = [],
            maintenanceIssues = [],
            misses = [],
            wins = [],
            ...blueBookData
        } = data;

        // Check if entry already exists for this date
        const existingEntry = await BlueBook.findOne({
            where: {
                restaurant_id: blueBookData.restaurant_id,
                date: blueBookData.date,
                is_active: true
            }
        });

        if (existingEntry) {
            throw new Error('Entry already exists for this date');
        }

        // Create Main Entry
        const blueBook = await BlueBook.create(blueBookData, { transaction });
        const blueBookId = blueBook.blue_book_id;

        // Create Sub Entries
        await Promise.all([
            ...item86s.map(item => item86Service.createItem86({ ...item, item86_comment: item.comment, blue_book_id: blueBookId }, transaction)),
            ...miscNotes.map(item => miscNoteService.createMiscNote({ ...item, misc_notes_comment: item.comment, blue_book_id: blueBookId }, transaction)),
            ...staffNotes.map(item => staffNoteService.createStaffNote({ ...item, staff_notes_comment: item.comment, blue_book_id: blueBookId }, transaction)),
            ...callOuts.map(item => callOutService.createCallOut({ ...item, call_out_comment: item.comment, blue_book_id: blueBookId }, transaction)),
            ...maintenanceIssues.map(item => maintenanceIssueService.createMaintenanceIssue({ ...item, maintenance_issue_comment: item.comment, blue_book_id: blueBookId }, transaction)),
            ...misses.map(item => missService.createMiss({ ...item, misses_comment: item.comment, blue_book_id: blueBookId }, transaction)),
            ...wins.map(item => winService.createWin({ ...item, wins_comment: item.comment, blue_book_id: blueBookId }, transaction))
        ]);

        await transaction.commit();

        // Fetch complete record
        return await getBlueBookByDate(blueBookData.restaurant_id, blueBookData.date);
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

/**
 * Get BlueBook entry by restaurant and date
 * @param {string} restaurant_id - Restaurant ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<Object>} BlueBook entry with relationships
 */
const getBlueBookByDate = async (restaurant_id, date) => {
    return await BlueBook.findAll({
        where: { restaurant_id, date, is_active: true },
        include: [
            { model: Item86, as: 'item86s' },
            { model: MiscNote, as: 'miscNotes' },
            { model: StaffNote, as: 'staffNotes' },
            { model: CallOut, as: 'callOuts' },
            { model: MaintenanceIssue, as: 'maintenanceIssues' },
            { model: Miss, as: 'misses' },
            { model: Win, as: 'wins' },
            { model: Restaurant, as: 'restaurant' },
            { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name', 'email'] }
        ]
    });
};

/**
 * Update BlueBook entry
 * @param {string} blue_book_id - BlueBook ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated BlueBook entry
 */
const updateBlueBook = async (blueBookId, data) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            item86s,
            miscNotes,
            staffNotes,
            callOuts,
            maintenanceIssues,
            misses,
            wins,
            ...blueBookData
        } = data;

        // Check if entry exists
        const existing = await BlueBook.findByPk(blueBookId);
        if (!existing) throw new Error('BlueBook entry not found');

        // Update Main Entry
        await BlueBook.update(blueBookData, {
            where: { blue_book_id: blueBookId },
            transaction
        });

        // Helper to update sub-entries: Delete all and recreate
        if (item86s) {
            await Item86.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(item86s.map(item => item86Service.createItem86({ ...item, item86_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }
        if (miscNotes) {
            await MiscNote.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(miscNotes.map(item => miscNoteService.createMiscNote({ ...item, misc_notes_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }
        if (staffNotes) {
            await StaffNote.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(staffNotes.map(item => staffNoteService.createStaffNote({ ...item, staff_notes_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }
        if (callOuts) {
            await CallOut.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(callOuts.map(item => callOutService.createCallOut({ ...item, call_out_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }
        if (maintenanceIssues) {
            await MaintenanceIssue.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(maintenanceIssues.map(item => maintenanceIssueService.createMaintenanceIssue({ ...item, maintenance_issue_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }
        if (misses) {
            await Miss.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(misses.map(item => missService.createMiss({ ...item, misses_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }
        if (wins) {
            await Win.destroy({ where: { blue_book_id: blueBookId }, transaction });
            await Promise.all(wins.map(item => winService.createWin({ ...item, wins_comment: item.comment, blue_book_id: blueBookId }, transaction)));
        }

        await transaction.commit();

        // We need restaurant_id and date for getBlueBookByDate. The updated instance might not have them if they weren't in payload.
        // So use existing record's details.
        const updatedBlueBook = await BlueBook.findByPk(blueBookId);
        return await getBlueBookByDate(updatedBlueBook.restaurant_id, updatedBlueBook.date);

    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

/**
 * Delete BlueBook entry (soft delete)
 * @param {string} blueBookId - BlueBook ID
 * @returns {Promise<void>}
 */
const deleteBlueBook = async (blueBookId) => {
    return await BlueBook.update({ is_active: false }, {
        where: { blue_book_id: blueBookId }
    });
};

module.exports = {
    createBlueBook,
    getBlueBookByDate,
    updateBlueBook,
    deleteBlueBook
};
