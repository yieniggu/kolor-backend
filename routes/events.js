/*
    Event routes
    /api/events
*/
const { Router } = require("express");
const { check } = require("express-validator");
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/events");
const { jwtValidator } = require("../middlewares/jwtValidator");
const { validateFields } = require("../middlewares/fieldValidators");
const { isDate } = require("../helpers/isDate");

const router = Router();

// validate token
router.use(jwtValidator);

// get events
router.get("/", getEvents);

// create events
router.post(
  "/",
  [
    check("title", "Title is required").not().isEmpty(),
    check("start", "Start date is required").custom(isDate),
    check("end", "End date is required").custom(isDate),
    validateFields,
  ],
  createEvent
);

router.put("/:id", updateEvent);

router.delete("/:id", deleteEvent);

module.exports = router;
