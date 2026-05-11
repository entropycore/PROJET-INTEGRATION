const timelineService = require('./timeline.service');

exports.getMyTimeline = async (req, res, next) => {
  try {
    const entries = await timelineService.getTimelineByStudentId(req.user.id);
    res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

exports.addTimelineEntry = async (req, res, next) => {
  try {
    const data = {
      ...req.body,        
      studentId: req.user.id,
    };
    const newEntry = await timelineService.createEntry(data);
    res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    next(error);
  }
};

exports.updateTimelineEntry = async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    const updated = await timelineService.updateEntry(entryId, req.user.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteTimelineEntry = async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    await timelineService.deleteEntry(entryId, req.user.id);
    res.status(200).json({ success: true, message: 'Étape supprimée' });
  } catch (error) {
    next(error);
  }
};