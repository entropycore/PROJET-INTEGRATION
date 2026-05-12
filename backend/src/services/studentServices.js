const prisma = require('../config/prisma');

const updateStudentProfile = async (studentId, data) => {
  const existingStudent = await prisma.student.findUnique({
    where: { id: parseInt(studentId, 10) }
  });
  if (!existingStudent) {
    throw new Error('Student not found');
  }

  const allowedUpdates = ['firstName', 'lastName', 'email', 'bio', 'phone', 'major'];
  const updates = {};
  for (const key of allowedUpdates) {
    if (data[key] !== undefined) {
      updates[key] = data[key];
    }
  }

  const updatedStudent = await prisma.student.update({
    where: { id: parseInt(studentId, 10) },
    data: updates,
    include: { skills: true, projects: true }
  });

  return updatedStudent;
};

module.exports = { updateStudentProfile };