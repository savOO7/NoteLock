const express = require("express");
const router = express.Router();
const fetchuser = require("../midddleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1
//get all the notes using GET "api/notes/fetchallnotes".login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

//ROUTE 2
//adding notes using POST "api/notes/addnote".login required
router.post(
  "/addnote",
  fetchuser,
  body("title", "Enter a valid title").isLength({ min: 3 }),
  body("description", "Description must be at least 5 characters").isLength({
    min: 5,
  }),
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).send({ errors: error.array() });
      }
      const note = new Notes({
        user: req.user.id,
        title,
        description,
        tag,
      });
      const savedNote = await note.save();
      res.send(savedNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

//ROUTE 3
//updating notes using PUT "api/notes/updatenote/:id".login required

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    const newnote = {};

    if (title) {
      newnote.title = title;
    }
    if (description) {
      newnote.description = description;
    }
    if (tag) {
      newnote.tag = tag;
    }

    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Note Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorised user");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newnote },
      { new: true }
    );
    res.json(note);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

//ROUTE 4
//deleting notes using DELETE "api/notes/delnote/:id".login required
router.delete("/delnote/:id", fetchuser, async (req, res) => {
  try {
    let note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).send("Note Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Unauthorised user");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.send("Notes deleted");

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
