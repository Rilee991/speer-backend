const { isEmpty, isNull, isUndefined } = require("lodash");
const mongoose = require("mongoose");

const Note = require("../../models/Note");

const listNotes = async (req, res) => {
    try {
        const userId = req.user._id;
        const notes = await Note.find({
            $or: [{
                owner: userId
            }, {
                'sharedWith.user': userId
            }],
            isDeleted: false
        });

        return res.status(200).json({ error: false, message: notes });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

const getNoteDetails = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const noteId = new mongoose.Types.ObjectId(req.params.id);

        if(!noteId) throw new Error("Invalid request. Note id isn't present.");

        const noteDoc = await Note.findOne({
            _id: noteId,
            $or: [{
                owner: userId 
            }, {
                'sharedWith.user': userId
            }],
            isDeleted: false
        });

        if(!noteDoc) throw new Error("Note doesn't exists or unauthorised.");

        return res.status(200).json({ error: false, message: noteDoc });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

const createNote = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title = "", description = "" } = req.body;

        if(!title && !description)  throw new Error("Title or description must be present");

        const resp = await Note.create({ title, description, owner: userId, isDeleted: false, updatedBy: userId });

        return res.status(200).json({ error: false, message: resp._id });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

const updateNote = async (req, res) => {
    try {
        const userId = req.user._id;
        const updatedFields = { };
        let canUpdate = false;

        if(!isNull(req.body.title) && !isUndefined(req.body.title)) updatedFields["title"] = req.body.title;
        if(!isNull(req.body.description) && !isUndefined(req.body.description)) updatedFields["description"] = req.body.description;

        if(isEmpty(updatedFields))  throw new Error("No fields present to be updated");

        const noteId = new mongoose.Types.ObjectId(req.params.id);

        const noteDoc = await Note.findOne({
            _id: noteId,
            isDeleted: false,
            $or: [{
                owner: userId 
            }, {
                'sharedWith.user': userId
            }]
        });

        if(!noteDoc) throw new Error("Note doesn't exists or unauthorised.");
        if(noteDoc.owner.toString() == userId.toString()) canUpdate = true;

        if(!canUpdate) {
            noteDoc.sharedWith.forEach(sharedUser => {
                if(sharedUser.user.toString() == userId.toString() && sharedUser.role == "editor") {
                    canUpdate = true;
                }
            });
        }

        if(!canUpdate) throw new Error("You don't have permissions to update the note.");

        updatedFields["updatedBy"] = userId;

        await noteDoc.updateOne(updatedFields);

        return res.status(200).json({ error: false, message: "Note updated successfully." });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

const deleteNote = async (req, res) => {
    try {
        const userId = req.user._id;
        const updatedFields = { updatedBy: userId, isDeleted: true };

        const noteId = new mongoose.Types.ObjectId(req.params.id);

        const noteDoc = await Note.findOne({
            _id: noteId,
            isDeleted: false,
            owner: userId
        });

        if(!noteDoc) throw new Error("Note doesn't exists or unauthorised.");

        await noteDoc.updateOne(updatedFields);

        return res.status(200).json({ error: false, message: "Note deleted successfully." });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

const shareNote = async (req, res) => {
    try {
        const userId = req.user._id;
        const { userId: reciepientId = "", role: reciepientRole = "" } = req.body;
        const noteId = new mongoose.Types.ObjectId(req.params.id);
        const updatedFields = { updatedBy: userId };
        let isOwner = false, isValidRole = true, isAlreadShared = false;

        if(isNull(reciepientId) || isUndefined(reciepientId)) throw new Error("No reciepient present.");
        if(!["viewer", "editor"].includes(reciepientRole)) throw new Error("Invalid role provided.");

        const noteDoc = await Note.findOne({
            _id: noteId,
            isDeleted: false,
            $or: [{
                owner: userId 
            }, {
                'sharedWith.user': userId
            }]
        });

        if(!noteDoc) throw new Error("Note doesn't exists or unauthorised.");
        if(userId.toString() == reciepientId) throw new Error("You cannot share your note to yourself.");
        if(noteDoc.owner.toString() == reciepientId) throw new Error("You cannot share the note to owner again!");
        
        noteDoc.sharedWith.forEach(sharedUser => {
            if(sharedUser.user.toString() == reciepientId) {
                isAlreadShared = true;
                return;
            }
        });

        if(isAlreadShared) throw new Error("Note already shared with the user");

        if(noteDoc.owner.toString() == userId.toString()) {
            updatedFields["userId"] = new mongoose.Types.ObjectId(reciepientId);
            updatedFields["role"] = reciepientRole;
            isOwner = true;
        }

        if(!isOwner) {
            noteDoc.sharedWith.forEach(sharedUser => {
                if(sharedUser.user.toString() == userId.toString()) {
                    if(["viewer"].includes(sharedUser.role) && reciepientRole == "editor") {
                        isValidRole = false;
                    } else {
                        updatedFields["userId"] = new mongoose.Types.ObjectId(reciepientId);
                        updatedFields["role"] = reciepientRole;
                    }

                    return;
                }
            });
        }

        if(!isValidRole) throw new Error("Viewer cannot share to others with editor access.");

        await noteDoc.updateOne({
            updatedBy: updatedFields.updatedBy,
            $push: {
                sharedWith: {
                    user: updatedFields.userId,
                    role: updatedFields.role
                }
            }
        });

        return res.status(200).json({ error: false, message: "Note shared successfully." });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

const searchNotes = async (req, res) => {
    try {
        const query = req.query?.q;
        const searchText = query?.replaceAll(" ", "").split(",").join(" ");
        const userId = req.user._id;

        if(!searchText) throw new Error("No text present to be searched");

        const notes = await Note.find({
            isDeleted: false,
            $or: [{
                owner: userId
            }, {
                "sharedWith.user": userId
            }],
            $text: { $search: searchText }
        });

        return res.status(200).json({ error: false, message: notes });
    } catch(err) {
        return res.status(401).json({ error: true, message: err.message });
    }
}

module.exports = {
    listNotes,
    getNoteDetails,
    createNote,
    updateNote,
    deleteNote,
    shareNote,
    searchNotes
}
