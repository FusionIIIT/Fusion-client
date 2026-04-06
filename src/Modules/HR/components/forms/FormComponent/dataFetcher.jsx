import { fetchInboxData } from "../../../services/api";

export const fetchData = async () => {
  try {
    const data = await fetchInboxData();
    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
    // Fallback to mock if needed
    return {
      headers: ["Form Id", "User", "Designation", "Date", "View", "Track"],
      requestData: [
        {
          formId: "101202",
          user: "Atul Gupta",
          designation: "Professor",
          date: "12 October 2024",
        },
        {
          formId: "101203",
          user: "Atul Gupta",
          designation: "Professor",
          date: "29 October 2024",
        },
        {
          formId: "101204",
          user: "V K Jain",
          designation: "Professor",
          date: "29 October 2024",
        },
        {
          formId: "101205",
          user: "Pankaj sharma",
          designation: "Professor",
          date: "29 October 2024",
        },
      ],
      inboxData: [
        {
          formId: "101204",
          user: "Rajesh Kumar",
          designation: "Assistant Professor",
          date: "15 October 2024",
        },
        {
          formId: "101205",
          user: "Priya Singh",
          designation: "Lecturer",
          date: "20 October 2024",
        },
        {
          formId: "101207",
          user: "Atul Gupta",
          designation: "Professor",
          date: "29 October 2024",
        },
      ],
      archiveData: [
        {
          formId: "101206",
          user: "Suresh Yadav",
          designation: "Professor",
          date: "01 October 2024",
        },
        {
          formId: "101207",
          user: "Amit Sharma",
          designation: "Professor",
          date: "05 October 2024",
        },
      ],
    };
  }
};
