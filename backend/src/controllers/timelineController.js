'use strict';

const timelineService = require('../services/timelineServices');

exports.getMyTimeline = async (req, res, next) => {
  try {
    const entries = await timelineService.getTimelineByStudentId(req.user.userId);
    return res.status(200).json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};


exports.addTimelineEntry = async (req, res, next) => {
  try {
    const newEntry = await timelineService.createEntry(req.user.userId, req.body);
    return res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    next(error);
  }
};


exports.updateTimelineEntry = async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.id, 10);
   
    const updated = await timelineService.updateEntry(entryId, req.user.userId, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};


exports.deleteTimelineEntry = async (req, res, next) => {
  try {
    const entryId = parseInt(req.params.id, 10);
    
    await timelineService.deleteEntry(entryId, req.user.userId);
    return res.status(200).json({ success: true, message: 'Étape supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};