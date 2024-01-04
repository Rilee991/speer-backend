const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor']}
    }],
    isDeleted: { type: Boolean, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

noteSchema.index({ title: "text", description: "text" });

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
