import { host } from "../../../routes/globalRoutes";

const messRoute = "/mess/api";

export const announcementRoute = `${host}${messRoute}/announcements/`;
export const operationsBoardRoute = `${host}${messRoute}/operations-board/`;
export const viewMenuRoute = `${host}${messRoute}/menuApi/`;
export const menuPollRoute = `${host}${messRoute}/menuPollApi/`;
export const menuPollVoteRoute = `${host}${messRoute}/menuPollVoteApi/`;
export const checkRegistrationStatusRoute = `${host}${messRoute}/checkRegistrationStatusApi/`;
export const viewRegistrationRequestsRoute = `${host}${messRoute}/registrationRequestApi/`;
export const registrationRequestRoute = viewRegistrationRequestsRoute;
export const viewBillsRoute = `${host}${messRoute}/get_student_bill/`;
export const rebateRoute = `${host}${messRoute}/rebateApi/`;
export const specialFoodRequestRoute = `${host}${messRoute}/specialRequestApi/`;
export const feedbackRoute = `${host}${messRoute}/feedbackApi/`;
export const paymentRoute = `${host}${messRoute}/paymentsApi/`;
export const vacationSurveyRoute = `${host}${messRoute}/vacationSurvey/`;
export const vacationSurveyResponseRoute = `${host}${messRoute}/vacationSurveyResponse/`;

export const viewRegistrationDataRoute = `${host}${messRoute}/get_mess_students/`;
export const getMessStatusRoute = `${host}${messRoute}/checkRegistrationStatusApi/`;
export const deregistrationRequestRoute = `${host}${messRoute}/deRegistrationRequestApi/`;
export const updatePaymentRequestRoute = `${host}${messRoute}/updatePaymentRequestApi/`;
export const wardenDecisionRoute = `${host}${messRoute}/warden-decisions/`;
export const updateSemDatesRoute = `${host}${messRoute}/messRegApi/`;
export const updateBalanceRequestRoute = `${host}${messRoute}/updatePaymentRequestApi/`;
export { host };
export const viewBalanceStatusRoute = `${host}${messRoute}/get_mess_balance_statusApi/`;

export const viewUpdatePaymentRequestsRoute = updatePaymentRequestRoute;
