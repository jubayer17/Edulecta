import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import "quill/dist/quill.snow.css";

import Home from "./pages/student/Home.jsx";
import CoursesList from "./pages/student/CoursesList";
import CourseDetails from "./pages/student/CourseDetails";
import TopPicksCoursesPage from "./pages/student/TopPicksCoursesPage";
import NewlyAddedCoursesPage from "./pages/student/NewlyAddedCoursesPage";
import MyEnrollments from "./pages/student/MyEnrollments.jsx";
import PendingPurchases from "./pages/student/PendingPurchases.jsx";
import Cart from "./pages/student/Cart.jsx";
import Player from "./pages/student/Player";
import Loading from "./components/student/Loading";

import Educator from "./pages/educator/Educator";
import Dashboard from "./pages/educator/Dashboard";
import AddCourse from "./pages/educator/AddCourse";
import MyCourses from "./pages/educator/MyCourses";
import StudentsEnrolled from "./pages/educator/StudentsEnrolled";
import UpdateCourses from "./pages/educator/UpdateCourses";
import Navbar from "./components/student/Navbar.jsx";
import BottomNavigation from "./components/student/BottomNavigation.jsx";
import CartDrawer from "./components/student/CartDrawer.jsx";
import { ToastContainer } from "react-toastify";

import { AppContextProvider } from "./context/AppContextProvider"; // <--- Import provider

const App = () => {
  const isEducatorRoute = useMatch("/educator/*");
  return (
    <AppContextProvider>
      {" "}
      {/* <-- Wrap here */}
      <div className="text-default min-h-screen bg-white">
        <ToastContainer />
        {!isEducatorRoute && <Navbar />}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course-list" element={<CoursesList />} />
          <Route path="/course-list/:input" element={<CoursesList />} />
          <Route path="/top-picks-courses" element={<TopPicksCoursesPage />} />
          <Route
            path="/newly-added-courses"
            element={<NewlyAddedCoursesPage />}
          />
          <Route path="/my-enrollments" element={<MyEnrollments />} />
          <Route path="/pending-purchases" element={<PendingPurchases />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/course/:id" element={<CourseDetails />} />
          <Route path="/player/:courseId" element={<Player />} />
          <Route path="/loading/:path" element={<Loading />} />

          <Route path="/educator" element={<Educator />}>
            <Route path="/educator" element={<Dashboard />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="update-courses" element={<UpdateCourses />} />
            <Route path="students-enrolled" element={<StudentsEnrolled />} />
          </Route>
        </Routes>

        {/* Bottom Navigation for Mobile */}
        {!isEducatorRoute && <BottomNavigation />}

        {/* Cart Drawer */}
        <CartDrawer />
      </div>
    </AppContextProvider>
  );
};

export default App;
