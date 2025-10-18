import React, { useEffect, useState } from "react";
import { getTeachers } from "../../api/userService";
import {
  getTimeSlots,
  getAppointmentPurposes,
} from "../../api/metadataService";
import Button from "../../components/common/Button";
import Dropdown from "../../components/common/Dropdown";
import Input from "../../components/common/Input";
import { createAppointment } from "../../api/appointmentService";
import { toast } from "react-toastify";

const AppointmentForm = () => {
  const [teachers, setTeachers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [formData, setFormData] = useState({
    teacher: "",
    date: "",
    time: "",
    purpose: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [teachersRes, slotsRes, purposesRes] = await Promise.all([
          getTeachers(),
          getTimeSlots(),
          getAppointmentPurposes(),
        ]);

        const teacherArr = teachersRes?.data?.data || [];
        const slotArr = slotsRes?.data?.data || slotsRes?.data || [];
        const purposeArr = purposesRes?.data?.data || [];

        setTeachers(
          teacherArr.map((t) => ({
            value: t._id,
            label: t.name || "Unknown Teacher",
          }))
        );

        setSlots(
          slotArr.map((slot) => ({
            value: slot,
            label: slot,
          }))
        );

        setPurposes(
          purposeArr.map((p) => ({
            value: p.value || p._id || p.name,
            label: p.label || p.name || p.value,
          }))
        );
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAppointment(formData);
      toast.success("Appointment created successfully!");
      setFormData({
        teacher: "",
        date: "",
        time: "",
        purpose: "",
        message: "",
      });
    } catch (err) {
      console.error("Appointment Creation Failed:", err);
      toast.error("Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-xl font-semibold mb-6 text-center">
        Create Appointment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Dropdown
          label="Select Teacher"
          id="teacher"
          name="teacher"
          options={teachers}
          value={formData.teacher}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Select a teacher"
          size="md"
        />

        <Input
          label="Select Date"
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={loading}
          min={new Date().toISOString().split("T")[0]}
        />

        <Dropdown
          label="Select Time Slot"
          id="time"
          name="time"
          options={slots}
          value={formData.time}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Select time slot"
          size="md"
        />

        <Dropdown
          label="Purpose"
          id="purpose"
          name="purpose"
          options={purposes}
          value={formData.purpose}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Select purpose"
          size="md"
        />

        <Input
          label="Message (optional)"
          id="message"
          name="message"
          type="text"
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          placeholder="Enter message or note..."
        />

        <Button type="submit" disabled={loading} fullWidth>
          {loading ? "Creating Appointment..." : "Create Appointment"}
        </Button>
      </form>
    </div>
  );
};

export default AppointmentForm;
