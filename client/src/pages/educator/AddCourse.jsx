/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import Quill from "quill";
import axios from "axios";
import { useContext } from "react";
import { AppContext } from "./../../context/AppContext";

const AddCourse = () => {
  // Your original working states
  const [jsonFile, setJsonFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Loading states for both upload methods
  const [isJsonUploading, setIsJsonUploading] = useState(false);
  const [isDetailedUploading, setIsDetailedUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Detailed form states - FIXED: Added discount field and made courseOfferPrice optional
  const [courseData, setCourseData] = useState({
    courseTitle: "",
    courseDescription: "",
    coursePrice: "",
    courseOfferPrice: "", // This is optional - will calculate discount from this
    discount: "", // This is what the database expects
    courseCategory: "",
    courseThumbnail: null,
    courseContent: [], // stores all the chapters we create
    isPublished: true, // Added this field that appears in your DB
  });

  // State for fetched categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [detailedThumbnailPreview, setDetailedThumbnailPreview] =
    useState(null);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  const { backendUrl, getToken, navigate } = useContext(AppContext);

  // Setting up the rich text editor for course descriptions
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["link", "blockquote", "code-block"],
            [{ align: [] }],
            ["clean"],
          ],
        },
        placeholder:
          "Describe your course content, what students will learn, and any prerequisites...",
      });

      // Update our state whenever someone types in the editor
      quill.on("text-change", () => {
        const content = quill.root.innerHTML;
        setCourseData((prev) => ({
          ...prev,
          courseDescription: content,
        }));
      });

      quillRef.current = quill;
    }
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch(`${backendUrl}/api/category`);
        const data = await response.json();

        if (data.success && data.categories) {
          // Extract category names from the API response
          const categoryNames = data.categories.map((cat) => cat.name);
          setCategories(categoryNames);
        } else {
          console.error("Failed to fetch categories:", data);
          // Fallback to default categories if API fails
          setCategories([
            "Web Development",
            "Mobile Development",
            "Data Science",
            "Machine Learning",
            "Cybersecurity",
            "Programming Languages",
            "Database",
            "Cloud Computing",
            "Digital Marketing",
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories if API fails
        setCategories([
          "Web Development",
          "Mobile Development",
          "Data Science",
          "Machine Learning",
          "Cybersecurity",
          "Programming Languages",
          "Database",
          "Cloud Computing",
          "Digital Marketing",
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [backendUrl]);

  // Function to handle successful course creation
  const handleCourseSuccess = (courseTitle) => {
    setShowSuccessModal(true);

    // After a short delay, redirect to my courses with hard reload
    setTimeout(() => {
      navigate("/educator/my-courses");
      // Force a hard reload to ensure fresh data
      window.location.reload();
    }, 3000);
  };

  // Function to calculate discount percentage from offer price
  const calculateDiscount = (originalPrice, offerPrice) => {
    if (!originalPrice || !offerPrice) return 0;
    const original = parseFloat(originalPrice);
    const offer = parseFloat(offerPrice);
    if (original <= 0 || offer >= original) return 0;
    return Math.round(((original - offer) / original) * 100);
  };

  // Your original working JSON upload functions
  const handleJsonChange = (e) => {
    const file = e.target.files[0];
    if (file) setJsonFile(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Your original working create course function
  const handleCreateCourse = async () => {
    if (!jsonFile) return alert("Please select a JSON file for course data");
    if (!imageFile)
      return alert("Please select an image file for course thumbnail");

    setIsJsonUploading(true);

    try {
      const token = await getToken();

      // Read and parse JSON file
      const jsonText = await jsonFile.text();
      let courseData;
      try {
        courseData = JSON.parse(jsonText);
      } catch {
        setIsJsonUploading(false);
        return alert("Invalid JSON file");
      }

      // Ensure the JSON data has the discount field if it's missing
      if (
        !courseData.discount &&
        courseData.courseOfferPrice &&
        courseData.coursePrice
      ) {
        courseData.discount = calculateDiscount(
          courseData.coursePrice,
          courseData.courseOfferPrice
        );
      } else if (!courseData.discount) {
        courseData.discount = 0; // Default discount
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData)); // must be a JSON string
      formData.append("image", imageFile); // must match upload.single("image")

      // Send request (NO manual Content-Type)
      const response = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // only add auth header
          },
        }
      );

      if (response.data.success) {
        console.log("Created Course:", response.data);

        // Reset form on success
        setJsonFile(null);
        setImageFile(null);
        setThumbnailPreview(null);

        // Show success modal and redirect
        handleCourseSuccess(courseData.courseTitle || "Your course");
      } else {
        alert(
          "Failed to create course: " + (response.data.error || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Create course error:", err.response?.data || err.message);
      alert(
        `Error creating course: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setIsJsonUploading(false);
    }
  };

  // Detailed form functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Auto-calculate discount when price or offer price changes
      if (name === "coursePrice" || name === "courseOfferPrice") {
        if (updated.coursePrice && updated.courseOfferPrice) {
          updated.discount = calculateDiscount(
            updated.coursePrice,
            updated.courseOfferPrice
          );
        } else {
          updated.discount = 0;
        }
      }

      return updated;
    });
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData((prev) => ({
        ...prev,
        courseThumbnail: file,
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setDetailedThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Functions to manage chapters - add, edit, delete
  const addChapter = () => {
    const newChapter = {
      chapterId: `chapter_${Date.now()}`,
      chapterOrder: courseData.courseContent.length + 1,
      chapterTitle: "",
      chapterContent: [], // this will hold all the lectures for this chapter
    };

    setCourseData((prev) => ({
      ...prev,
      courseContent: [...prev.courseContent, newChapter],
    }));
  };

  const updateChapter = (chapterIndex, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, index) =>
        index === chapterIndex ? { ...chapter, [field]: value } : chapter
      ),
    }));
  };

  const deleteChapter = (chapterIndex) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.filter(
        (_, index) => index !== chapterIndex
      ),
    }));
  };

  // Functions to handle individual lectures within chapters
  const addLecture = (chapterIndex) => {
    const newLecture = {
      lectureId: `lecture_${Date.now()}`,
      lectureTitle: "",
      lectureDuration: 0,
      lectureUrl: "",
      isPreviewFree: false,
      lectureOrder:
        courseData.courseContent[chapterIndex].chapterContent.length + 1,
      lectureResources: [], // Added this field that appears in your DB
    };

    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, index) =>
        index === chapterIndex
          ? {
              ...chapter,
              chapterContent: [...chapter.chapterContent, newLecture],
            }
          : chapter
      ),
    }));
  };

  const updateLecture = (chapterIndex, lectureIndex, field, value) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, cIndex) =>
        cIndex === chapterIndex
          ? {
              ...chapter,
              chapterContent: chapter.chapterContent.map((lecture, lIndex) =>
                lIndex === lectureIndex
                  ? { ...lecture, [field]: value }
                  : lecture
              ),
            }
          : chapter
      ),
    }));
  };

  const deleteLecture = (chapterIndex, lectureIndex) => {
    setCourseData((prev) => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, cIndex) =>
        cIndex === chapterIndex
          ? {
              ...chapter,
              chapterContent: chapter.chapterContent.filter(
                (_, lIndex) => lIndex !== lectureIndex
              ),
            }
          : chapter
      ),
    }));
  };

  // Detailed form submit using your original working logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make sure we have all the basic course info filled out
    if (
      !courseData.courseDescription ||
      courseData.courseDescription.trim() === "" ||
      courseData.courseDescription === "<p><br></p>"
    ) {
      alert("Please provide a course description");
      return;
    }

    // Can't have a course without any chapters!
    if (courseData.courseContent.length === 0) {
      alert("Please add at least one chapter to your course");
      return;
    }

    // Go through each chapter and make sure everything's filled out properly
    for (let i = 0; i < courseData.courseContent.length; i++) {
      const chapter = courseData.courseContent[i];
      if (!chapter.chapterTitle.trim()) {
        alert(`Please provide a title for Chapter ${i + 1}`);
        return;
      }
      if (chapter.chapterContent.length === 0) {
        alert(
          `Please add at least one lecture to Chapter ${i + 1}: ${
            chapter.chapterTitle
          }`
        );
        return;
      }

      // Check each lecture in this chapter
      for (let j = 0; j < chapter.chapterContent.length; j++) {
        const lecture = chapter.chapterContent[j];
        if (!lecture.lectureTitle.trim()) {
          alert(
            `Please provide a title for Lecture ${j + 1} in Chapter ${i + 1}`
          );
          return;
        }
        if (!lecture.lectureUrl.trim()) {
          alert(
            `Please provide a URL for Lecture ${j + 1} in Chapter ${i + 1}`
          );
          return;
        }
        if (lecture.lectureDuration <= 0) {
          alert(
            `Please provide a valid duration for Lecture ${j + 1} in Chapter ${
              i + 1
            }`
          );
          return;
        }
      }
    }

    setIsDetailedUploading(true);

    // Use your original working submission logic
    try {
      const token = await getToken();

      // FIXED: Prepare the course data with proper field mapping
      const submissionData = {
        ...courseData,
        // Ensure we have the discount field the database expects
        discount: courseData.discount || 0,
        // Convert price fields to numbers
        coursePrice: parseFloat(courseData.coursePrice) || 0,
        courseOfferPrice: courseData.courseOfferPrice
          ? parseFloat(courseData.courseOfferPrice)
          : undefined,
      };

      // Prepare FormData using the detailed form data
      const formData = new FormData();
      formData.append("courseData", JSON.stringify(submissionData)); // must be a JSON string
      formData.append("image", courseData.courseThumbnail); // must match upload.single("image")

      // Send request (NO manual Content-Type) - your original working code
      const response = await axios.post(
        `${backendUrl}/api/educator/add-course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // only add auth header
          },
        }
      );

      if (response.data.success) {
        console.log("Created Course:", response.data);

        // Reset the form
        setCourseData({
          courseTitle: "",
          courseDescription: "",
          coursePrice: "",
          courseOfferPrice: "",
          discount: "",
          courseCategory: "",
          courseThumbnail: null,
          courseContent: [],
          isPublished: true,
        });
        setDetailedThumbnailPreview(null);
        if (quillRef.current) {
          quillRef.current.setText("");
        }

        // Show success modal and redirect
        handleCourseSuccess(submissionData.courseTitle || "Your course");
      } else {
        alert(
          "Failed to create course: " + (response.data.error || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Create course error:", err.response?.data || err.message);
      alert(
        `Error creating course: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setIsDetailedUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Loading Overlay for JSON Upload */}
      {isJsonUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-spin mx-auto"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "0.8s",
                }}
              ></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Uploading Course
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we process your JSON file and create your
              course...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Detailed Form Upload */}
      {isDetailedUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto"
                style={{
                  animationDirection: "reverse",
                  animationDuration: "0.8s",
                }}
              ></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Creating Course
            </h3>
            <p className="text-gray-600 mb-4">
              Please wait while we create your course with all the detailed
              content...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            {/* Success Animation */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full mx-auto animate-ping opacity-30"></div>
            </div>

            {/* Success Message */}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-gray-600 mb-6">
              Your course has been created successfully! You will be redirected
              to your courses page shortly.
            </p>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>

            <p className="text-sm text-gray-500">
              Redirecting to My Courses...
            </p>
          </div>
        </div>
      )}

      {/* Main page header */}
      <div className="w-full mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Add New Course</h1>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Create Course
            </div>
          </div>
          <p className="text-gray-600">
            Create and publish a new course for your students
          </p>
        </div>
      </div>

      <div className="w-full flex-1 space-y-8">
        {/* Your original working JSON upload section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <h2 className="text-lg font-semibold">
              Quick Upload (JSON + Image)
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Course JSON File:
              </label>
              <input type="file" accept=".json" onChange={handleJsonChange} />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold">
                Course Thumbnail:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="mt-2 w-32 h-32 object-cover rounded"
                />
              )}
            </div>

            <button
              onClick={handleCreateCourse}
              disabled={isJsonUploading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isJsonUploading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
              }`}
            >
              {isJsonUploading ? "Uploading..." : "Create Course (JSON Upload)"}
            </button>
          </div>
        </div>

        {/* Detailed form section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {/* Form section header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
              <h2 className="text-lg font-semibold">
                Detailed Course Creation
              </h2>
            </div>

            {/* All the form inputs go here */}
            <div className="p-6 space-y-6">
              {/* Basic course title input */}
              <div>
                <label
                  htmlFor="courseTitle"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="courseTitle"
                  name="courseTitle"
                  value={courseData.courseTitle}
                  onChange={handleInputChange}
                  placeholder="Enter course title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>

              {/* Dropdown to pick what kind of course this is */}
              <div>
                <label
                  htmlFor="courseCategory"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Course Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="courseCategory"
                  name="courseCategory"
                  value={courseData.courseCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  required
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories...</option>
                  ) : (
                    <>
                      <option value="">Select a category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Rich text editor for detailed course description */}
              <div>
                <label
                  htmlFor="courseDescription"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Course Description <span className="text-red-500">*</span>
                </label>
                <div
                  ref={editorRef}
                  className="quill-editor bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all duration-200"
                  style={{ minHeight: "200px" }}
                />
              </div>

              {/* Course pricing - regular price and optional discount price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="coursePrice"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Course Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="coursePrice"
                    name="coursePrice"
                    value={courseData.coursePrice}
                    onChange={handleInputChange}
                    placeholder="99.99"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="courseOfferPrice"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Offer Price ($){" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="courseOfferPrice"
                    name="courseOfferPrice"
                    value={courseData.courseOfferPrice}
                    onChange={handleInputChange}
                    placeholder="79.99"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discount"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Discount %{" "}
                    <span className="text-gray-500 text-xs">
                      (Auto-calculated)
                    </span>
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={courseData.discount}
                    readOnly
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Upload a nice thumbnail image for the course */}
              <div>
                <label
                  htmlFor="courseThumbnail"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Course Thumbnail <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      id="courseThumbnail"
                      name="courseThumbnail"
                      onChange={handleThumbnailChange}
                      accept="image/*"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  {detailedThumbnailPreview && (
                    <div className="w-20 h-12 rounded-lg overflow-hidden border-2 border-orange-200">
                      <img
                        src={detailedThumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* This is where we build the actual course content */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Course Content
                  </h3>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm flex items-center gap-2"
                  >
                    Add Chapter
                  </button>
                </div>

                {courseData.courseContent.length === 0 ? (
                  <div className="bg-gray-50/80 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-4">No chapters added yet</p>
                    <button
                      type="button"
                      onClick={addChapter}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                    >
                      Add Your First Chapter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {courseData.courseContent.map((chapter, chapterIndex) => (
                      <div
                        key={chapter.chapterId}
                        className="bg-gray-50/80 rounded-lg p-6 border border-gray-200"
                      >
                        {/* Chapter title and delete button */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-gray-700">
                            Chapter {chapterIndex + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => deleteChapter(chapterIndex)}
                            className="delete-btn p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                            title="Delete Chapter"
                          >
                            ❌
                          </button>
                        </div>

                        {/* Input for the chapter name */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chapter Title{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={chapter.chapterTitle}
                            onChange={(e) =>
                              updateChapter(
                                chapterIndex,
                                "chapterTitle",
                                e.target.value
                              )
                            }
                            placeholder="Enter chapter title"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                            required
                          />
                        </div>

                        {/* All the lectures for this chapter */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700">
                              Lectures
                            </h5>
                            <button
                              type="button"
                              onClick={() => addLecture(chapterIndex)}
                              className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-xs flex items-center gap-1"
                            >
                              Add Lecture
                            </button>
                          </div>

                          {chapter.chapterContent.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <p className="text-gray-500 text-sm mb-3">
                                No lectures added
                              </p>
                              <button
                                type="button"
                                onClick={() => addLecture(chapterIndex)}
                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-sm"
                              >
                                Add First Lecture
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {chapter.chapterContent.map(
                                (lecture, lectureIndex) => (
                                  <div
                                    key={lecture.lectureId}
                                    className="bg-white rounded-lg p-4 border border-gray-200"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <h6 className="text-sm font-medium text-gray-600">
                                        Lecture {lectureIndex + 1}
                                      </h6>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteLecture(
                                            chapterIndex,
                                            lectureIndex
                                          )
                                        }
                                        className="delete-btn p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                        title="Delete Lecture"
                                      >
                                        ❌
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* What to call this lecture */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          Lecture Title{" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="text"
                                          value={lecture.lectureTitle}
                                          onChange={(e) =>
                                            updateLecture(
                                              chapterIndex,
                                              lectureIndex,
                                              "lectureTitle",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Enter lecture title"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                                          required
                                        />
                                      </div>

                                      {/* How long is this lecture? */}
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          Duration (minutes){" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="number"
                                          value={lecture.lectureDuration}
                                          onChange={(e) =>
                                            updateLecture(
                                              chapterIndex,
                                              lectureIndex,
                                              "lectureDuration",
                                              parseInt(e.target.value) || 0
                                            )
                                          }
                                          placeholder="15"
                                          min="1"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                                          required
                                        />
                                      </div>

                                      {/* Where can students watch this lecture? */}
                                      <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          Lecture URL{" "}
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          type="url"
                                          value={lecture.lectureUrl}
                                          onChange={(e) =>
                                            updateLecture(
                                              chapterIndex,
                                              lectureIndex,
                                              "lectureUrl",
                                              e.target.value
                                            )
                                          }
                                          placeholder="https://youtu.be/example"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-sm"
                                          required
                                        />
                                      </div>

                                      {/* Should this be free for people to preview? */}
                                      <div className="md:col-span-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={lecture.isPreviewFree}
                                            onChange={(e) =>
                                              updateLecture(
                                                chapterIndex,
                                                lectureIndex,
                                                "isPreviewFree",
                                                e.target.checked
                                              )
                                            }
                                            className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                                          />
                                          <span className="text-sm text-gray-700">
                                            Make this lecture free for preview
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer */}
            <div className="bg-gray-50/80 border-t border-gray-200/60 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  All fields marked with * are required
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDetailedUploading}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      isDetailedUploading
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transform hover:scale-105"
                    }`}
                  >
                    {isDetailedUploading
                      ? "Creating..."
                      : "Create Course (Detailed Form)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Additional Info Cards */}
      <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            📄
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Upload Content</h3>
          <p className="text-gray-600 text-sm">
            Add videos, documents, and resources after creating the course
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            👥
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Reach Students</h3>
          <p className="text-gray-600 text-sm">
            Your course will be visible to students once published
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            💰
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Earn Revenue</h3>
          <p className="text-gray-600 text-sm">
            Start earning from student enrollments immediately
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;
