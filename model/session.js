const { Schema, model } = require('mongoose');
const sessionSchema = new Schema({
    uid: {
        type: 'string',
        default: null
    }
})

const SessionModel = model('Session', sessionSchema)
module.exports = SessionModel