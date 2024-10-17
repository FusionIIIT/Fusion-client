import React, { useState } from "react";
import "./FeedbackForm.css";

const FeedbackForm = ({ department }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState("5");

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Feedback for ${department}: ${feedback} \nRating: ${rating}`);
    // Handle form submission (API call etc.)
  };

  return (
    <div className="feedback-container">
      <h2>{department} Department Feedback</h2>
      <form onSubmit={handleSubmit} className="feedback-form">
        <label htmlFor="feedback">Your Feedback:</label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder="Enter your feedback here..."
          required
        />

        <label htmlFor="rating">Rate the Department:</label>
        <select id="rating" value={rating} onChange={handleRatingChange}>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>

        <button type="submit" className="submit-btn">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
