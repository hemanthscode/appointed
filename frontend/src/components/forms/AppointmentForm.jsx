import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Dropdown from '../common/Dropdown';
import Button from '../common/Button';
import { getDepartments, getAppointmentPurposes, getTimeSlots, getUserYears } from '../../api/metadataService';

const AppointmentForm = ({ onSubmit, loading, initialData = {}, serverError }) => {
  const [form, setForm] = useState({
    teacher: '',
    date: '',
    time: '',
    purpose: '',
    subject: '',
    message: '',
    ...initialData,
  });
  const [departments, setDepartments] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [times, setTimes] = useState([]);
  const [userYears, setUserYears] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getDepartments().then((res) => setDepartments(res.data.data.map((dep) => ({ value: dep, label: dep }))));
    getAppointmentPurposes().then((res) => setPurposes(res.data.data.map((p) => ({ value: p.value, label: p.label }))));
    getTimeSlots().then((res) => setTimes(res.data.data.map((t) => ({ value: t, label: t }))));
    getUserYears().then((res) => setUserYears(res.data.data.map((y) => ({ value: y, label: y }))));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.teacher) errs.teacher = 'Teacher ID is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.time) errs.time = 'Time is required';
    if (!form.purpose) errs.purpose = 'Purpose is required';
    if (!form.subject) errs.subject = 'Subject is required';
    if (form.message && form.message.length > 500) errs.message = 'Message must be less than 500 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input id="teacher" name="teacher" label="Teacher ID" value={form.teacher} onChange={handleChange} error={errors.teacher} />
      <Input id="date" name="date" type="date" label="Appointment Date" value={form.date} onChange={handleChange} error={errors.date} />
      <Dropdown id="time" name="time" label="Time" options={times} value={form.time} onChange={handleChange} error={errors.time} />
      <Dropdown id="purpose" name="purpose" label="Purpose" options={purposes} value={form.purpose} onChange={handleChange} error={errors.purpose} />
      <Input id="subject" name="subject" label="Subject" value={form.subject} onChange={handleChange} error={errors.subject} />
      <Input
        id="message"
        name="message"
        label="Message (optional)"
        type="textarea"
        value={form.message}
        onChange={handleChange}
        error={errors.message}
        className="resize-y h-24"
      />
      {serverError && <div className="text-red-600">{serverError}</div>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Appointment'}
      </Button>
    </form>
  );
};

AppointmentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialData: PropTypes.object,
  serverError: PropTypes.string,
};

AppointmentForm.defaultProps = {
  loading: false,
  initialData: {},
  serverError: '',
};

export default AppointmentForm;
