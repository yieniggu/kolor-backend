const Event = require("../models/Event");

const getEvents = async (req, res) => {
  const events = await Event.find().populate("user", "name");

  res.json({
    ok: true,
    events,
  });
};

const createEvent = async (req, res) => {
  console.log(req.body);

  const event = new Event(req.body);
  event.user = req.uid;

  try {
    const savedEvent = await event.save();

    res.status(201).json({
      ok: true,
      savedEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      msg: "REACH ADMIN",
    });
  }
};

const updateEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        ok: false,
        msg: "Event doesn't exists!",
      });
    }

    if (event.user.toString() !== req.uid) {
      return res.status(401).json({
        ok: false,
        msg: "You're not allowed to do that!",
      });
    }

    const newEvent = { ...req.body, user: req.uid };

    const updatedEvent = await Event.findByIdAndUpdate(eventId, newEvent, {
      new: true,
    });

    return res.status(200).json({
      ok: true,
      event: updatedEvent,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      msg: "error qlo",
    });
  }
};

const deleteEvent = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        ok: false,
        msg: "Event doesn't exists!",
      });
    }

    if (event.user.toString() !== req.uid) {
      return res.status(401).json({
        ok: false,
        msg: "You're not allowed to do that!",
      });
    }

    await Event.findByIdAndDelete(eventId);

    return res.status(200).json({
      ok: true,
      msg: "Deleted",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      msg: "error qlo",
    });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
