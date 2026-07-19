import React from "react";
import { Card, Title } from "@mantine/core";
import TeachingCreditEvaluationSection from "../ThesisResearch/TeachingCredit/TeachingCreditEvaluationSection";

/**
 * Shown to every student here in Academic (not gated to PhD/PG like the
 * "Doctoral & PG Research" module) -- any student registered for a course a
 * PhD Research Scholar is teaching needs to submit feedback for it,
 * regardless of their own programme. The underlying evaluation logic/models
 * live under ThesisResearch/TeachingCredit alongside the rest of the
 * Teaching Credit feature (HOD allocation, Supervisor visibility, etc).
 */
export default function TeachingCreditFeedback() {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Teaching Credit Feedback
      </Title>
      <TeachingCreditEvaluationSection />
    </Card>
  );
}
