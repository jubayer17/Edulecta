import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { assets, dummyCourses } from "../../assets/assets";
import Quill from "quill";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

const UpdateCourses = () => {
  const {
    educatorDashboard,
    isEducator,
    syncEducatorDashboard,
    backendUrl,
    token,
    updateCourse,
    user,
    getToken,
  } = useContext(AppContext);
  const educatorId = educatorDashboard.educatorId;
  console.log("Educator ID:", educatorId);
  console.log(educatorDashboard);

  const [courses, setCourses] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  console.log("Educator Courses:", courses);
  console.log("Enrolled Students:", enrolledStudents);
  console.log("Published Courses Raw:", educatorDashboard.publishedCourses);

  // Function to fetch complete educator courses
  const fetchEducatorCourses = useCallback(async () => {
    if (!isEducator) {
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${backendUrl}/api/educator/get-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.courses) {
          setCourses(data.courses);
        }
      }
    } catch (error) {
      console.error("Error fetching educator courses:", error);
    } finally {
      setLoading(false);
    }
  }, [isEducator, backendUrl, getToken]);

  // Function to extract and organize enrolled students from published courses
  const extractEnrolledStudents = useCallback(() => {
    if (
      !educatorDashboard.publishedCourses ||
      educatorDashboard.publishedCourses.length === 0
    ) {
      setEnrolledStudents([]);
      return;
    }

    const allStudents = [];

    // Extract from educatorDashboard.publishedCourses structure
    educatorDashboard.publishedCourses.forEach((course) => {
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        course.enrolledStudents.forEach((enrollment) => {
          allStudents.push({
            studentId: enrollment.studentId,
            enrolledAt: enrollment.enrolledAt,
            courseId: course.courseId,
            courseTitle: course.title,
            courseThumbnail: course.thumbnail,
            coursePrice: course.price,
            isPublished: course.isPublished,
          });
        });
      }
    });

    // Sort by enrollment date (most recent first)
    const sortedStudents = allStudents.sort(
      (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt)
    );

    setEnrolledStudents(sortedStudents);
    console.log("Extracted enrolled students from schema:", sortedStudents);
    console.log("Total enrolled students:", sortedStudents.length);
  }, [educatorDashboard.publishedCourses]);

  // Setting up the rich text editor for course descriptions
  useEffect(() => {
    if (editorRef.current && !quillRef.current && courseData) {
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

      // Set initial content
      quill.root.innerHTML = courseData.courseDescription || "";

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
  }, [courseData]);

  // Fetch educator courses on component mount
  useEffect(() => {
    fetchEducatorCourses();
  }, [fetchEducatorCourses]);

  // Extract enrolled students when published courses data changes
  useEffect(() => {
    extractEnrolledStudents();
  }, [extractEnrolledStudents]);

  console.log("Courses:", courses);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCourseData({
      ...course,
      courseContent: course.courseContent || [],
    });
    setThumbnailPreview(course.courseThumbnail);

    // Reset Quill editor
    if (quillRef.current) {
      quillRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        setThumbnailPreview(reader.result);
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
    if (
      window.confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      setCourseData((prev) => ({
        ...prev,
        courseContent: prev.courseContent.filter(
          (_, index) => index !== chapterIndex
        ),
      }));
    }
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
    if (
      window.confirm(
        "Are you sure you want to delete this lecture? This action cannot be undone."
      )
    ) {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Existing validations remain unchanged
    if (
      !courseData.courseDescription ||
      courseData.courseDescription.trim() === "" ||
      courseData.courseDescription === "<p><br></p>"
    ) {
      alert("Please provide a course description");
      return;
    }

    if (courseData.courseContent.length === 0) {
      alert("Please add at least one chapter to your course");
      return;
    }

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

    if (!educatorId) {
      alert("Educator info not loaded yet. Please wait.");
      return;
    }

    console.log("baler matha", educatorId);

    // ---------------- Minimal change for local file upload ----------------
    // Helper to convert File -> base64 data URL
    const fileToDataUrl = (file) =>
      new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        } catch (err) {
          reject(err);
        }
      });

    try {
      let payload;

      // If the thumbnail is a File (user picked a local file), convert it to base64
      if (courseData.courseThumbnail instanceof File) {
        // convert file to data URL (base64)
        const base64 = await fileToDataUrl(courseData.courseThumbnail);

        // create a copy of courseData but replace courseThumbnail with base64 string
        payload = {
          ...courseData,
          courseThumbnail: base64,
          educator: { _id: educatorId },
        };
      } else {
        // no file selected or already a string/url — keep your original behavior
        payload = {
          ...courseData,
          educator: { _id: educatorId },
        };
      }

      // Call your existing updateCourse exactly as before
      const updated = await updateCourse(payload);

      // Optionally handle the response (your existing code didn't change)
      // e.g., refresh, notify, etc.
    } catch (err) {
      console.error("Error in handleSubmit (thumbnail handling):", err);
      alert("Failed to update course. Check console for details.");
    }
    // --------------------------------------------------------------------
  };

  const categories = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "Cybersecurity",
    "Programming Languages",
    "Database",
    "Cloud Computing",
    "UI/UX Design",
    "Digital Marketing",
  ];

  // Filter courses based on search term
  const filteredCourses = courses
    ? courses.filter(
        (course) =>
          course.courseTitle
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.courseDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  if (!courses && loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
      {/* Main page header */}
      <div className="w-full mb-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-800">Update Courses</h1>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {courses ? filteredCourses.length : 0} Courses{" "}
              {searchTerm ? "Found" : "Available"}
            </div>
          </div>
          <p className="text-gray-600">
            Select and modify your existing courses - add chapters, edit
            content, or update information
          </p>
        </div>
      </div>

      {!selectedCourse ? (
        // Course Selection View
        <div className="w-full flex-1">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {/* Section header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Select Course to Update
                </h2>
                <div className="text-sm opacity-90">
                  {filteredCourses.length} of {courses?.length || 0} courses
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="p-6 border-b border-gray-200/60">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img
                    src={assets.search_icon}
                    alt="search"
                    className="w-5 h-5 text-gray-400"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search courses by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/60 backdrop-blur-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <img
                      src={assets.cross_icon}
                      alt="clear"
                      className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Course Cards Grid */}
            <div className="p-6">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                    <img
                      src={assets.search_icon}
                      alt="No courses"
                      className="w-8 h-8 opacity-50"
                    />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">
                    {searchTerm ? "No courses found" : "No published courses"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {searchTerm
                      ? `Try searching for different keywords`
                      : "You haven't published any courses yet. Create and publish your first course to see it here."}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="bg-white/60 backdrop-blur-sm rounded-xl shadow-md border border-white/40 overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => handleCourseSelect(course)}
                    >
                      <div className="relative">
                        <img
                          src={
                            course.courseThumbnail ||
                            "https://via.placeholder.com/300x180/4F46E5/FFFFFF?text=Course"
                          }
                          alt={course.courseTitle}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          {course.isPublished ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                              Published
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full border border-yellow-200">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                          {course.courseTitle}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>
                            {course.courseContent?.length || 0} Chapters
                          </span>
                          <span>
                            {course.enrolledStudents?.length || 0} Students
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-orange-600 font-semibold">
                              ${course.courseOfferPrice || course.coursePrice}
                            </span>
                          </div>
                          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
                            Edit Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Course Update Form View
        <div className="w-full flex-1">
          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                setSelectedCourse(null);
                setCourseData(null);
                setThumbnailPreview(null);
                if (quillRef.current) {
                  quillRef.current = null;
                }
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <img
                src={assets.arrow_icon}
                alt="back"
                className="w-4 h-4 rotate-180"
              />
              Back to Course Selection
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {/* Form section header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <h2 className="text-lg font-semibold">
                  Update Course Information
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  Course ID: {selectedCourse._id}
                </p>
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
                    value={courseData?.courseTitle || ""}
                    onChange={handleInputChange}
                    placeholder="Enter course title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    required
                  />
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
                    className="quill-editor bg-white/50 backdrop-blur-sm border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200"
                    style={{ minHeight: "200px" }}
                  />
                </div>

                {/* Course pricing - regular price and optional discount price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      value={courseData?.coursePrice || ""}
                      onChange={handleInputChange}
                      placeholder="99.99"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
                      value={courseData?.courseOfferPrice || ""}
                      onChange={handleInputChange}
                      placeholder="79.99"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Upload a nice thumbnail image for the course */}
                <div>
                  <label
                    htmlFor="courseThumbnail"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Course Thumbnail
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        id="courseThumbnail"
                        name="courseThumbnail"
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    {thumbnailPreview && (
                      <div className="w-20 h-12 rounded-lg overflow-hidden border-2 border-blue-200">
                        <img
                          src={thumbnailPreview}
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
                      <img
                        src={assets.add_icon}
                        alt="add"
                        className="w-4 h-4"
                      />
                      Add Chapter
                    </button>
                  </div>

                  {courseData?.courseContent?.length === 0 ? (
                    <div className="bg-gray-50/80 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <img
                        src={assets.lesson_icon}
                        alt="lessons"
                        className="w-12 h-12 mx-auto mb-3 opacity-50"
                      />
                      <p className="text-gray-500 mb-4">
                        No chapters added yet
                      </p>
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
                      {courseData?.courseContent?.map(
                        (chapter, chapterIndex) => (
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
                                <img
                                  src={assets.cross_icon}
                                  alt="delete"
                                  className="cross-icon w-5 h-5"
                                />
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
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
                                  <img
                                    src={assets.add_icon}
                                    alt="add"
                                    className="w-3 h-3"
                                  />
                                  Add Lecture
                                </button>
                              </div>

                              {chapter.chapterContent?.length === 0 ? (
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
                                  {chapter.chapterContent?.map(
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
                                            <img
                                              src={assets.cross_icon}
                                              alt="delete"
                                              className="cross-icon w-4 h-4"
                                            />
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
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
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
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
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
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                              required
                                            />
                                          </div>

                                          {/* Preview Free Checkbox */}
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
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                              />
                                              <span className="text-sm text-gray-700">
                                                Make this lecture free for
                                                preview
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
                        )
                      )}
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
                      onClick={() => {
                        setSelectedCourse(null);
                        setCourseData(null);
                        setThumbnailPreview(null);
                        if (quillRef.current) {
                          quillRef.current = null;
                        }
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
                    >
                      Update Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateCourses;
