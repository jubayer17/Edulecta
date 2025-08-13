import Educator from "../models/Educator.js"; // Correct path
import User from "../models/User.js"; // Correct path
import Course from "../models/Course.js"; // Correct path

/**
 * Create Educator document from existing user data
 * @param {String} userId - current logged-in user's ID
 */
export const createEducatorFromUser = async (userId) => {
  try {
    // Fetch user data
    const user = await User.findById(userId).populate("enrolledCourses");
    if (!user || !user.isEducator) {
      throw new Error("User is not an educator or does not exist");
    }

    // Fetch all courses published by this educator
    const courses = await Course.find({ "educator._id": userId }).populate(
      "enrolledStudents"
    );
    console.log(
      `Found ${courses.length} courses for educator ${user.username}`
    );
    // Assemble publishedCourses array
    const publishedCourses = courses.map((course) => {
      const totalEnrollments = course.enrolledStudents.length;
      const totalEarnings = totalEnrollments * (course.coursePrice || 0);

      const enrolledStudents = course.enrolledStudents.map((student) => ({
        studentId: student._id,
        enrolledAt: student.createdAt || new Date(),
      }));

      return {
        courseId: course._id,
        title: course.courseTitle,
        price: course.coursePrice || 0,
        enrolledStudents,
        totalEnrollments,
        totalEarnings,
      };
    });

    // Calculate total stats
    const totalCourses = publishedCourses.length;
    const totalEnrollments = publishedCourses.reduce(
      (acc, c) => acc + c.totalEnrollments,
      0
    );
    const totalEarnings = publishedCourses.reduce(
      (acc, c) => acc + c.totalEarnings,
      0
    );

    // Create new educator document
    const newEducator = new Educator({
      _id: user._id,
      name: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
      publishedCourses,
      totalCourses,
      totalEnrollments,
      totalEarnings,
    });

    await newEducator.save();
    console.log("Educator database created successfully!");
    return newEducator;
  } catch (err) {
    console.error("Error creating educator:", err.message);
    throw err;
  }
};
