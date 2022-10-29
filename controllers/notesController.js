const User = require("../models/User");
const Note = require("../models/Note");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) {
    return res.status(400).json({ message: "No Notes found" });
  }

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );
  res.json(notesWithUser);
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  // Confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  const taggedUser = await User.findById(user).exec();

  if (!taggedUser) {
    return res.status(400).json({ message: "User ID don't exist" });
  }

  const newNote = await Note.create({
    user,
    title,
    text,
  });

  if (newNote) {
    return res.status(201).json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, text, title, user, completed } = req.body;

  if (!id || !text || !title || !user || typeof completed !== boolean) {
    return res(400).json({ message: "All fields are required" });
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res(400).json({ message: "Note not found" });
  }

  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  const taggedUser = await User.findById(user).exec();

  if (!taggedUser) {
    return res.status(400).json({ message: "Provided user don't exist" });
  }

  note.text = text;
  note.user = user;
  note.comleted = comleted;
  note.title = title;

  const updatedNote = await note.save();

  res.json(`${updatedNote.title} updated`);
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote, 
  deleteNote
};
