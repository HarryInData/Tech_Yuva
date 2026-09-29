const eventsService = require('../services/events.service');
const ApiResponse = require('../utils/ApiResponse');

async function getEvents(req, res, next) {
  try {
    const { status, mode, limit, offset } = req.query;
    const result = await eventsService.listEvents({
      status,
      mode,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
}

async function getEventBySlug(req, res, next) {
  try {
    const event = await eventsService.getEventBySlug(req.params.slug);
    res.json(ApiResponse.success(event));
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const eventId = req.params.id;
    const userId = req.user?.id || null;
    const registration = await eventsService.registerForEvent(eventId, req.body, userId);
    res.status(201).json(ApiResponse.created(registration, 'Event registration successful!'));
  } catch (error) {
    next(error);
  }
}

async function cancelRegistration(req, res, next) {
  try {
    const eventId = req.params.id;
    const identifier = req.user?.id || req.body.email;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or authentication required to cancel' });
    }
    const result = await eventsService.cancelEventRegistration(eventId, identifier);
    res.json(ApiResponse.success(result, 'Registration cancelled successfully'));
  } catch (error) {
    next(error);
  }
}

async function getAttendees(req, res, next) {
  try {
    const eventId = req.params.id;
    const attendees = await eventsService.getEventAttendees(eventId);
    res.json(ApiResponse.success(attendees));
  } catch (error) {
    next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const authorId = req.user?.id;
    const event = await eventsService.createEvent(req.body, authorId);
    res.status(201).json(ApiResponse.created(event, 'Event created successfully'));
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await eventsService.updateEvent(req.params.id, req.body);
    res.json(ApiResponse.success(event, 'Event updated successfully'));
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    await eventsService.deleteEvent(req.params.id);
    res.json(ApiResponse.success(null, 'Event deleted successfully'));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEvents,
  getEventBySlug,
  register,
  cancelRegistration,
  getAttendees,
  createEvent,
  updateEvent,
  deleteEvent,
};
