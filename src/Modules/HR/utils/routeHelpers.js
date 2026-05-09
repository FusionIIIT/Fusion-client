export const getViewUrl = (formType, id) => {
  const viewUrlMap = {
    leave: `/hr/leave/file_handler/${id}`,
    cpda_adv: `/hr/cpda_adv/view/${id}`,
    ltc: `/hr/ltc/file_handler/${id}`,
    cpda_claim: `/hr/cpda_claim/file_handler/${id}`,
    appraisal: `/hr/appraisal/file_handler/${id}`,
  };
  return viewUrlMap[formType] || `/hr/leave/file_handler/${id}`;
};

export const getTrackUrl = (formType, id) => {
  const trackUrlMap = {
    leave: `/hr/FormView/leaveform_track/${id}`,
    cpda_adv: `/hr/FormView/cpda_adv_track/${id}`,
    ltc: `/hr/FormView/ltc_track/${id}`,
    cpda_claim: `/hr/FormView/cpda_claim_track/${id}`,
    appraisal: `/hr/FormView/appraisal_track/${id}`,
  };
  return trackUrlMap[formType] || `/hr/FormView/leaveform_track/${id}`;
};
