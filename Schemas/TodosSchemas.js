const mongoose = require('mongoose');

const TodosSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        date: {
            type: Date,
            default: Date.now,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    }
);

// Static methods
TodosSchema.statics.findActive = function () {
    return this.find({ status: 'active' });
};

TodosSchema.statics.findInactive = function () {
    return this.find({ status: 'inactive' });
};

module.exports = TodosSchema;
