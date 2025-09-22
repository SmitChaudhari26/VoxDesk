const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    note: {  // Changed from 'content' to 'note' to match your frontend
        type: String,
        required: true
    },
    userId: {  // Add user association
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);