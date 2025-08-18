import { clerkClient } from "@clerk/express";
import connectDB from "../configs/mongodb.js";
import Category from "../models/Category.js";
import Course from "../models/Course.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    await connectDB();

    // First, fetch only PUBLISHED courses to extract unique categories
    const allCourses = await Course.find({ isPublished: true }, "courseCategory");

    // Extract unique course categories from published courses only
    const uniqueCourseCategories = [
      ...new Set(
        allCourses
          .map((course) => course.courseCategory)
          .filter((category) => category && category.trim() !== "")
      ),
    ];

    // Check which categories exist in the Category database
    const existingCategories = await Category.find({
      name: { $in: uniqueCourseCategories },
      isActive: true,
    });

    const existingCategoryNames = existingCategories.map((cat) => cat.name);

    // Find categories that don't exist in the database
    const missingCategories = uniqueCourseCategories.filter(
      (categoryName) => !existingCategoryNames.includes(categoryName)
    );

    // Create missing categories in the database
    if (missingCategories.length > 0) {
      const categoriesToCreate = missingCategories.map((categoryName) => ({
        name: categoryName,
        description: `Auto-generated category for ${categoryName} courses`,
        isActive: true,
        courseCount: 0,
        createdBy: "system", // Since this is auto-generated
      }));

      await Category.insertMany(categoriesToCreate);
      console.log(
        `✅ Created ${missingCategories.length} new categories:`,
        missingCategories
      );
    }

    // Now fetch all categories from the database
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .select("name description courseCount createdAt");

    // Update course counts for each category (ONLY PUBLISHED COURSES)
    for (const category of categories) {
      const courseCount = allCourses.filter(
        (course) => course.courseCategory === category.name
      ).length;

      if (category.courseCount !== courseCount) {
        await Category.findByIdAndUpdate(category._id, { courseCount });
        category.courseCount = courseCount;
      }
    }

    // Filter out categories with 0 published courses
    const categoriesWithCourses = categories.filter(cat => cat.courseCount > 0);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: categoriesWithCourses,
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Add new category (educator only)
export const addCategory = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId } = auth || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User authentication required",
      });
    }

    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "Category name must be at least 2 characters long",
      });
    }

    await connectDB();

    // Check if category already exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category already exists",
      });
    }

    // Create new category
    const newCategory = new Category({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userId,
    });

    await newCategory.save();

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: {
        _id: newCategory._id,
        name: newCategory.name,
        description: newCategory.description,
        courseCount: newCategory.courseCount,
        createdAt: newCategory.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error adding category:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get categories with course count and course details
export const getCategoriesWithCourses = async (req, res) => {
  try {
    await connectDB();

    // Get all active categories
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    // Get course statistics for each category
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        // Find courses in this category
        const courses = await Course.find({
          courseCategory: category.name,
          isPublished: true,
        })
          .select(
            "courseTitle courseThumbnail coursePrice enrolledStudents educator createdAt"
          )
          .populate("educator", "username imageUrl")
          .sort({ enrolledStudents: -1 }) // Sort by most enrolled students
          .limit(10); // Limit to top 10 courses per category

        // Calculate total enrollments for this category
        const totalEnrollments = courses.reduce(
          (sum, course) => sum + (course.enrolledStudents?.length || 0),
          0
        );

        return {
          _id: category._id,
          name: category.name,
          description: category.description,
          courseCount: courses.length,
          totalEnrollments,
          courses: courses.map((course) => ({
            _id: course._id,
            courseTitle: course.courseTitle,
            courseThumbnail: course.courseThumbnail,
            coursePrice: course.coursePrice,
            enrolledStudents: course.enrolledStudents?.length || 0,
            educator: course.educator,
            createdAt: course.createdAt,
          })),
          createdAt: category.createdAt,
        };
      })
    );

    // Sort categories by total enrollments (most popular first)
    categoriesWithStats.sort((a, b) => b.totalEnrollments - a.totalEnrollments);

    return res.status(200).json({
      success: true,
      message: "Categories with courses fetched successfully",
      categories: categoriesWithStats,
    });
  } catch (error) {
    console.error("❌ Error fetching categories with courses:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update category course count (called when courses are added/removed)
export const updateCategoryCount = async (categoryName) => {
  try {
    await connectDB();

    // Count only PUBLISHED courses
    const courseCount = await Course.countDocuments({
      courseCategory: categoryName,
      isPublished: true,
    });

    await Category.updateOne(
      { name: categoryName },
      { $set: { courseCount, updatedAt: Date.now() } }
    );

    console.log(
      `✅ Updated course count for category "${categoryName}": ${courseCount} published courses`
    );
  } catch (error) {
    console.error(
      `❌ Error updating category count for "${categoryName}":`,
      error
    );
  }
};

// Delete category (educator only)
export const deleteCategory = async (req, res) => {
  try {
    const auth = req.auth();
    const { userId } = auth || {};

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User authentication required",
      });
    }

    const { categoryId } = req.params;

    await connectDB();

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Check if any courses use this category
    const coursesWithCategory = await Course.countDocuments({
      courseCategory: category.name,
    });

    if (coursesWithCategory > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. ${coursesWithCategory} courses are using this category.`,
      });
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
