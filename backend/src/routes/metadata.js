const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const departments = [
  "Computer Science", "Information Technology", "Electronics Engineering",
  "Mechanical Engineering", "Civil Engineering", "Mathematics",
  "Physics", "Chemistry", "Business Administration", "English Literature"
];

const subjectsByDepartment = {
  "Computer Science": ["Data Structures","Algorithms","Database Systems","Web Development","Machine Learning","Software Engineering","Computer Networks","Operating Systems"],
  "Mathematics": ["Calculus","Linear Algebra","Statistics","Discrete Mathematics","Numerical Methods"],
  "Physics": ["Classical Mechanics","Quantum Physics","Thermodynamics","Electromagnetism","Modern Physics"],
  "Chemistry": ["Organic Chemistry","Inorganic Chemistry","Physical Chemistry","Analytical Chemistry","Biochemistry"]
};

router.get('/departments', optionalAuth, asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { departments } });
}));

router.get('/subjects', asyncHandler(async (req, res) => {
  const { department } = req.query;
  const subjects = subjectsByDepartment[department] || [];
  res.status(200).json({ success: true, data: { department, subjects } });
}));

router.get('/time-slots', asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: {
    timeSlots: [
      "9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"
    ]
  }});
}));

router.get('/appointment-purposes', asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: {
    purposes: [
      { value: "academic-help", label: "Academic Help" },
      { value: "project-discussion", label: "Project Discussion" },
      { value: "career-guidance", label: "Career Guidance" },
      { value: "exam-preparation", label: "Exam Preparation" },
      { value: "research-guidance", label: "Research Guidance" },
      { value: "other", label: "Other" }
    ]
  }});
}));

router.get('/user-years', asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: {
    years: ["1st Year","2nd Year","3rd Year","4th Year","Graduate","Post Graduate"]
  }});
}));

module.exports = router;
