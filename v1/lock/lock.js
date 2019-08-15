var lockDb = require('./lockDb');

module.exports = {
    lock: lockDb.lock,
    unlock: lockDb.unlock,
    check: lockDb.check
};