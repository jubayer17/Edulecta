import React, { useState, useEffect, useRef } from "react";
import { assets } from "../../assets/assets";
import Quill from "quill";

const AddCourse = () => {
  const [courseData, setCourseData] = useState({
    courseTitle: "",
    courseDescription: "",
    coursePrice: "",
    courseOfferPrice: "",
    courseCategory: "",
    courseThumbnail: null,
    courseContent: [], // stores all the chapters we create
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

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

  const handleSubmit = (e) => {
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

    console.log("Course Data:", courseData);
    // This is where we'd actually save the course to our database
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
    "Digital Marketing",
  ];

  return (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pt-0 p-4 pt-8   bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40">
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

      {/* The actual course creation form */}
      <div className="w-full flex-1">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {/* Form section header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
              <h2 className="text-lg font-semibold">Course Information</h2>
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
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
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
                  {thumbnailPreview && (
                    <div className="w-20 h-12 rounded-lg overflow-hidden border-2 border-orange-200">
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
                    <img src={assets.add_icon} alt="add" className="w-4 h-4" />
                    Add Chapter
                  </button>
                </div>

                {courseData.courseContent.length === 0 ? (
                  <div className="bg-gray-50/80 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <img
                      src={assets.lesson_icon}
                      alt="lessons"
                      className="w-12 h-12 mx-auto mb-3 opacity-50"
                    />
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
                              <img
                                src={assets.add_icon}
                                alt="add"
                                className="w-3 h-3"
                              />
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
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 font-semibold"
                  >
                    Create Course
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
            <img
              src={assets.file_upload_icon}
              alt="upload"
              className="w-6 h-6"
            />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Upload Content</h3>
          <p className="text-gray-600 text-sm">
            Add videos, documents, and resources after creating the course
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <img src={assets.user_icon} alt="students" className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Reach Students</h3>
          <p className="text-gray-600 text-sm">
            Your course will be visible to students once published
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <img src={assets.earning_icon} alt="earnings" className="w-6 h-6" />
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
