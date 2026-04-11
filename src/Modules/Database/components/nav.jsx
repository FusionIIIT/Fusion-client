import React, { useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { CaretCircleLeft, CaretCircleRight } from "phosphor-react";
import { useSelector } from "react-redux";

export default function Nav() {
  const scrollContainerRef = useRef(null);
  const userRole = useSelector((state) => state.user.role);
  const location = useLocation();
  const navigate = useNavigate();

  const categoryFromUrl = new URLSearchParams(location.search).get("category");
  const activeCategory = ["ug", "pg", "phd"].includes(categoryFromUrl)
    ? categoryFromUrl
    : "ug";

  const handleCategoryChange = (category) => {
    navigate(`/database/view?category=${category}`);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -150,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 150,
        behavior: "smooth",
      });
    }
  };

  const categoryButtonStyle = (isActive) => ({
    padding: "8px 16px",
    marginRight: "10px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "1px solid #3498db",
    backgroundColor: isActive ? "#3498db" : "transparent",
    color: isActive ? "white" : "#3498db",
    fontWeight: isActive ? "600" : "400",
    fontSize: "14px",
  });

  const tabItems = [
    {
      title: "Course-wise Student Count",
      path: "/database/view",
      roles: ["acadadmin"],
      categories: ["ug", "pg"],
    },
    {
      title: "Student Course Detail BatchWise",
      path: "/database/student-courses",
      roles: ["acadadmin"],
      categories: ["ug"],
    },
    {
      title: "Student Grade Info BatchWise",
      path: "/database/students-grade",
      roles: ["acadadmin"],
      categories: ["ug"],
    },
    {
      title: "Unregistered Students BatchWise",
      path: "/database/unregistered-students",
      roles: ["acadadmin"],
      categories: ["ug"],
    },
  ];

  const filteredTabs = tabItems.filter(
    (tab) =>
      tab.roles.includes(userRole) && tab.categories.includes(activeCategory),
  );

  return (
    <div style={{ marginBottom: "30px" }}>
      {/* Category buttons */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}
      >
        <button
          style={categoryButtonStyle(activeCategory === "ug")}
          onClick={() => handleCategoryChange("ug")}
        >
          UG: Undergraduate
        </button>
        <button
          style={categoryButtonStyle(activeCategory === "pg")}
          onClick={() => handleCategoryChange("pg")}
        >
          PG: Post Graduate
        </button>
        <button
          style={categoryButtonStyle(activeCategory === "phd")}
          onClick={() => handleCategoryChange("phd")}
        >
          PhD: Doctor of Philosophy
        </button>
      </div>

      <hr style={{ margin: "0 0 12px 0", borderColor: "#e0e0e0" }} />

      {/* Sub-tabs shown for available category-specific views */}
      {filteredTabs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={scrollLeft}
          >
            <CaretCircleLeft size={24} />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              flexWrap: "nowrap",
              flex: 1,
              position: "relative",
              paddingBottom: "8px",
            }}
            ref={scrollContainerRef}
          >
            {filteredTabs.map((tab, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0",
                  whiteSpace: "nowrap",
                }}
              >
                <NavLink
                  to={`${tab.path}?category=${activeCategory}`}
                  style={({ isActive }) => ({
                    textDecoration: "none",
                    padding: "10px 15px",
                    color: isActive ? "#15abff" : "black",
                    display: "block",
                    fontSize: "14px",
                    borderBottom: isActive ? "3px solid #15abff" : "none",
                    fontWeight: isActive ? "600" : "400",
                    transition: "all 0.2s ease",
                  })}
                >
                  {tab.title}
                </NavLink>
              </div>
            ))}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                backgroundColor: "#e0e0e0",
              }}
            />
          </div>
          <button
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onClick={scrollRight}
          >
            <CaretCircleRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
