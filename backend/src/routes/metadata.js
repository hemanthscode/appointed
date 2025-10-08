const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Department = require('../models/Department');

const router = express.Router();

// @desc    Get all departments
// @route   GET /api/metadata/departments
// @access  Public (but optionally authenticated for additional info)
const getDepartments = asyncHandler(async (req, res) => {
  const departments = [
    "Computer Science",
    "Information Technology", 
    "Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Business Administration",
    "English Literature"
  ];

  res.status(200).json({
    success: true,
    data: {
      departments
    }
  });
});

// @desc    Get subjects by department
// @route   GET /api/metadata/subjects/:departmentId
// @access  Public
const getSubjects = asyncHandler(async (req, res) => {
  const { department } = req.query;

  // Mock subjects by department
  const subjectsByDepartment = {
    "Computer Science": [
      "Data Structures",
      "Algorithms", 
      "Database Systems",
      "Web Development",
      "Machine Learning",
      "Software Engineering",
      "Computer Networks",
      "Operating Systems"
    ],
    "Mathematics": [
      "Calculus",
      "Linear Algebra",
      "Statistics",
      "Discrete Mathematics",
      "Numerical Methods"
    ],
    "Physics": [
      "Classical Mechanics",
      "Quantum Physics", 
      "Thermodynamics",
      "Electromagnetism",
      "Modern Physics"
    ],
    "Chemistry": [
      "Organic Chemistry",
      "Inorganic Chemistry",
      "Physical Chemistry",
      "Analytical Chemistry",
      "Biochemistry"
    ]
  };

  const subjects = subjectsByDepartment[department] || [];

  res.status(200).json({
    success: true,
    data: {
      department,
      subjects
    }
  });
});

// @desc    Get available time slots
// @route   GET /api/metadata/time-slots
// @access  Public
const getTimeSlots = asyncHandler(async (req, res) => {
  const timeSlots = [
    "9:00 AM",
    "10:00 AM", 
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM"
  ];

  res.status(200).json({
    success: true,
    data: {
      timeSlots
    }
  });
});

// @desc    Get appointment purposes
// @route   GET /api/metadata/appointment-purposes
// @access  Public
const getAppointmentPurposes = asyncHandler(async (req, res) => {
  const purposes = [
    {
      value: "academic-help",
      label: "Academic Help"
    },
    {
      value: "project-discussion", 
      label: "Project Discussion"
    },
    {
      value: "career-guidance",
      label: "Career Guidance"
    },
    {
      value: "exam-preparation",
      label: "Exam Preparation"
    },
    {
      value: "research-guidance",
      label: "Research Guidance"
    },
    {
      value: "other",
      label: "Other"
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      purposes
    }
  });
});

// @desc    Get user years (for students)
// @route   GET /api/metadata/user-years
// @access  Public
const getUserYears = asyncHandler(async (req, res) => {
  const years = [
    "1st Year",
    "2nd Year", 
    "3rd Year",
    "4th Year",
    "Graduate",
    "Post Graduate"
  ];

  res.status(200).json({
    success: true,
    data: {
      years
    }
  });
});

// Routes
router.get('/departments', optionalAuth, getDepartments);
router.get('/subjects', getSubjects);
router.get('/time-slots', getTimeSlots);
router.get('/appointment-purposes', getAppointmentPurposes);
router.get('/user-years', getUserYears);

module.exports = router;
