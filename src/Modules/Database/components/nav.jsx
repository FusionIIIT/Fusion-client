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

  const activeLinkStyle = {
    backgroundColor: "#15abff13",
    color: "#15abff",
    borderBottom: "2px solid #15abff",
    borderBottomLeftRadius: "4px",
    borderBottomRightRadius: "4px",
  };

  const defaultLinkStyle = {
    textDecoration: "none",
    padding: "10px 15px",
    color: "black",
    display: "block",
    width: "100%",
    textAlign: "center",
    borderBottom: "2px solid #e0e0e0",
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
      categories: ["ug", "pg", "phd"],
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
  ];

  const filteredTabs = tabItems.filter(
    (tab) => tab.roles.includes(userRole) && tab.categories.includes(activeCategory)
  );

  return (
    <div style={{ marginBottom: "30px" }}>
      {/* Category buttons */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
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
        <div style={{ display: "flex", alignItems: "center", height: "5vh" }}>
          <button
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            onClick={scrollLeft}
          >
            <CaretCircleLeft size={25} />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              flexWrap: "nowrap",
            }}
            ref={scrollContainerRef}
          >
            {filteredTabs.map((tab, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", padding: "0" }}
              >
                <NavLink
                  to={`${tab.path}?category=${activeCategory}`}
                  style={({ isActive }) => ({
                    ...defaultLinkStyle,
                    ...(isActive ? activeLinkStyle : {}),
                  })}
                >
                  {tab.title}
                </NavLink>
              </div>
            ))}
          </div>
          <button
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            onClick={scrollRight}
          >
            <CaretCircleRight size={25} />
          </button>
        </div>
      )}
    </div>
  );
}

