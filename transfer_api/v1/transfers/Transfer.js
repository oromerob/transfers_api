const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');

class Transfer {
    constructor(transfer_obj) {
        this._id = new ObjectID();
        this.from = transfer_obj.from;
        this.to = transfer_obj.to;
        this.amount = transfer_obj.amount;
        this.status = 'pending';
        this.err = null;
        this.msg = null;
        this.log = [];
        this.dateCreated = moment.utc().format();
        this.initial = [];
    }
}

module.exports = Transfer;