const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Returns list of departments
 */
exports.getDepartments = async (req, res, next) => {
  try {
    res.status(200).json(helpers.successResponse(constants.DEPARTMENTS));
  } catch (err) {
    next(err);
  }
};

/**
 * Returns subjects for a given department
 */
exports.getSubjects = async (req, res, next) => {
  try {
    const { department } = req.query;
    // Simple mapping or fetch from DB if implemented
    const subjectsMap = {
      'Computer Science': ['Data Structures', 'Algorithms', 'Database Systems', 'Web Development', 'Machine Learning', 'Software Engineering', 'Computer Networks', 'Operating Systems'],
      Mathematics: ['Calculus', 'Linear Algebra', 'Statistics', 'Discrete Mathematics', 'Numerical Methods'],
      Physics: ['Classical Mechanics', 'Quantum Physics', 'Thermodynamics', 'Electromagnetism', 'Modern Physics'],
      Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry']
    };
    const subjects = subjectsMap[department] || [];
    res.status(200).json(helpers.successResponse({ department, subjects }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get available time slots for UI select options
 */
exports.getTimeSlots = async (req, res, next) => {
  try {
    res.status(200).json(helpers.successResponse(constants.TIME_SLOTS));
  } catch (err) {
    next(err);
  }
};

/**
 * Get appointment purposes
 */
exports.getAppointmentPurposes = async (req, res, next) => {
  try {
    res.status(200).json(helpers.successResponse(constants.APPOINTMENT_PURPOSES));
  } catch (err) {
    next(err);
  }
};

/**
 * Get academic years for students
 */
exports.getUserYears = async (req, res, next) => {
  try {
    res.status(200).json(helpers.successResponse(constants.USER_YEARS));
  } catch (err) {
    next(err);
  }
};
