/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateBankForm from "./components/CreateBankForm";
import TopicTable from "./components/TopicTable";
import AddQuestionForm from "./components/AddQuestionForm";
import { getQuestionBank, createBank, addTopic, addQuestion } from "./api";

export default function QuestionBankFeature() {
  const { courseCode } = useParams();
  const [banks, setBanks] = useState([]);

  const load = () => {
    if (courseCode)
      getQuestionBank(courseCode).then((data) => setBanks(data || []));
  };

  useEffect(() => {
    load();
  }, [courseCode]);

  const handleCreateBank = async (data) => {
    await createBank(courseCode, data);
    load();
  };

  const handleCreateTopic = async (data) => {
    await addTopic(courseCode, data.bankId, data);
    load();
  };

  const handleAddQuestion = async (data) => {
    await addQuestion(courseCode, data.bankId, data.topicId, data);
    load();
  };

  return (
    <div>
      <CreateBankForm onSubmit={handleCreateBank} />
      <TopicTable banks={banks} onSubmit={handleCreateTopic} />
      <AddQuestionForm banks={banks} onSubmit={handleAddQuestion} />
    </div>
  );
}
