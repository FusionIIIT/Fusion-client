/**
 * Custom Hooks for Health Center Data Fetching
 * Centralized hooks for consistent data fetching patterns
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";
import { handleApiCall } from "./apiErrorHandler";

/**
 * Generic data fetching hook
 */
const useHealthCenterData = (
  fetchFn,
  initialData = null,
  dependencies = [],
) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await handleApiCall(fetchFn(), "Failed to fetch data");
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [fetchFn]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Hook for fetching doctors
 */
export const useFetchDoctors = () => {
  return useHealthCenterData(api.fetchDoctors, []);
};

/**
 * Hook for fetching pathologists
 */
export const useFetchPathologists = () => {
  return useHealthCenterData(api.fetchPathologists, []);
};

/**
 * Hook for fetching doctor schedule
 */
export const useFetchDoctorSchedule = () => {
  return useHealthCenterData(api.fetchDoctorSchedule, []);
};

/**
 * Hook for fetching pathologist schedule
 */
export const useFetchPathologistSchedule = () => {
  return useHealthCenterData(api.fetchPathologistSchedule, []);
};

/**
 * Hook for fetching prescriptions
 */
export const useFetchPrescriptions = () => {
  return useHealthCenterData(api.fetchPrescriptions, []);
};

/**
 * Hook for fetching prescribed medicines
 */
export const useFetchPrescribedMedicines = () => {
  return useHealthCenterData(api.fetchPrescribedMedicines, []);
};

/**
 * Hook for fetching announcements
 */
export const useFetchAnnouncements = () => {
  return useHealthCenterData(api.fetchAnnouncements, []);
};

/**
 * Hook for fetching student dashboard
 */
export const useFetchStudentDashboard = () => {
  return useHealthCenterData(api.fetchStudentDashboard, {});
};

/**
 * Hook for fetching compounder dashboard
 */
export const useFetchCompounderDashboard = () => {
  return useHealthCenterData(api.fetchCompounderDashboard, {});
};

/**
 * Hook for fetching stock with pagination
 */
export const useFetchStock = (page = 1, search = "") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await handleApiCall(
      api.fetchStock(page, search),
      "Failed to fetch stock",
    );
    if (result.success) {
      setData(result.data.report_stock_view || []);
      setTotalPages(result.data.total_pages_stock_view || 1);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, totalPages, refetch };
};

/**
 * Hook for fetching required medicines with pagination
 */
export const useFetchRequiredMedicines = (page = 1, search = "") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await handleApiCall(
      api.fetchRequiredMedicines(page, search),
      "Failed to fetch required medicines",
    );
    if (result.success) {
      setData(result.data.report_required_view || []);
      setTotalPages(result.data.total_pages_required_view || 1);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, totalPages, refetch };
};

/**
 * Hook for fetching expired medicines with pagination
 */
export const useFetchExpiredMedicines = (page = 1, search = "") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await handleApiCall(
      api.fetchExpiredMedicines(page, search),
      "Failed to fetch expired medicines",
    );
    if (result.success) {
      setData(result.data.report_expired_view || []);
      setTotalPages(result.data.total_pages_expired_view || 1);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, totalPages, refetch };
};

/**
 * Hook for fetching all medicines
 */
export const useFetchAllMedicines = () => {
  return useHealthCenterData(api.fetchAllMedicines, []);
};

/**
 * Hook for fetching all doctors (compounder view)
 */
export const useFetchAllDoctors = () => {
  return useHealthCenterData(api.fetchAllDoctors, []);
};

/**
 * Hook for fetching all pathologists (compounder view)
 */
export const useFetchAllPathologists = () => {
  return useHealthCenterData(api.fetchAllPathologists, []);
};

/**
 * Hook for fetching compounder doctor schedules
 */
export const useFetchCompounderDoctorSchedule = () => {
  return useHealthCenterData(api.fetchCompounderDoctorSchedule, []);
};

/**
 * Hook for fetching compounder pathologist schedules
 */
export const useFetchCompounderPathologistSchedule = () => {
  return useHealthCenterData(api.fetchCompounderPathologistSchedule, []);
};

/**
 * Hook for fetching compounder prescriptions with pagination
 */
export const useFetchCompounderPrescriptions = (page = 1, search = "") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await handleApiCall(
      api.fetchCompounderPrescriptions(page, search),
      "Failed to fetch prescriptions",
    );
    if (result.success) {
      setData(result.data.report_prescriptions || []);
      setTotalPages(result.data.total_pages_prescriptions || 1);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, totalPages, refetch };
};

/**
 * Hook for fetching patient history with pagination
 */
export const useFetchPatientHistory = (userId, page = 1, search = "") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await handleApiCall(
      api.fetchPatientHistory(userId, page, search),
      "Failed to fetch patient history",
    );
    if (result.success) {
      setData(result.data.report_patient || []);
      setTotalPages(result.data.total_pages_patient || 1);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [userId, page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, totalPages, refetch };
};

export default useHealthCenterData;
