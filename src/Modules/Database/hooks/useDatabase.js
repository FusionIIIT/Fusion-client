import { useState, useCallback } from "react";
import axios from "axios";
import { showNotification } from "@mantine/notifications";

/**
 * useDatabase Hook
 * Shared state management for all database module components
 * Eliminates ~600 lines of duplicated state logic across 4 components
 *
 * Provides:
 * - Common state variables (batch, loading, error, data, etc.)
 * - API fetch with error handling and auth
 * - Reset functionality
 * - Pagination support
 *
 * Usage:
 *   const {
 *     batch, setBatch,
 *     loading, error,
 *     studentData, filteredData, setFilteredData,
 *     fetchData, reset
 *   } = useDatabase();
 */
export const useDatabase = (initialPageSize = 50) => {
  // ============ CORE STATE ============
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);

  // ============ DATA STATE ============
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // ============ PAGINATION STATE ============
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Reset all state to initial values
   * Call when category changes or component unmounts
   */
  const reset = useCallback(() => {
    setBatch(null);
    setStudentData([]);
    setFilteredData([]);
    setError(null);
    setShowData(false);
    setExportPreviewOpen(false);
    setCurrentPage(1);
  }, []);

  /**
   * Generic API fetch function with auth + error handling
   * @param {string} url - Full API endpoint
   * @param {object} params - Query parameters
   * @returns {Promise} API response data or null
   */
  const fetchData = useCallback(async (url, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        const errorMsg = "Authentication token not found. Please login again.";
        setError(errorMsg);
        showNotification({
          title: "Authentication Error",
          message: errorMsg,
          color: "red",
        });
        setLoading(false);
        return null;
      }

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          queryParams.append(key, value);
        }
      });

      const { data } = await axios.get(`${url}?${queryParams.toString()}`, {
        headers: { Authorization: `Token ${token}` },
        timeout: 30000, // 30 second timeout
      });

      return data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || err.message || "API request failed";
      setError(errorMsg);

      // Show notification only for critical errors
      if (err.response?.status === 403 || err.response?.status === 401) {
        showNotification({
          title: "Access Denied",
          message: "You don't have permission to access this resource",
          color: "red",
        });
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate pagination details
   * @returns {object} Pagination info for tables
   */
  const getPaginationInfo = useCallback(() => {
    const total = filteredData.length;
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, total);
    const paginatedData = filteredData.slice(startIdx, endIdx);
    const totalPages = Math.ceil(total / pageSize);

    return {
      total,
      startIdx,
      endIdx,
      paginatedData,
      totalPages,
      currentPage,
      pageSize,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [filteredData, currentPage, pageSize]);

  /**
   * Move to next page
   */
  const nextPage = useCallback(() => {
    const { totalPages } = getPaginationInfo();
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, getPaginationInfo]);

  /**
   * Move to previous page
   */
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  /**
   * Jump to specific page
   */
  const goToPage = useCallback((page) => {
    const sanitized = Math.max(1, parseInt(page, 10) || 1);
    setCurrentPage(sanitized);
  }, []);

  return {
    batch,
    setBatch,
    loading,
    setLoading,
    error,
    setError,
    showData,
    setShowData,
    exportPreviewOpen,
    setExportPreviewOpen,
    studentData,
    setStudentData,
    filteredData,
    setFilteredData,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    getPaginationInfo,
    nextPage,
    prevPage,
    goToPage,
    reset,
    fetchData,
  };
};

export default useDatabase;
