export enum EmbedSignUpFlowEventType {
  Cancel = "CANCEL",
  Finish = "FINISH",
  FinishOnboarding = "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
  FinishOnlyWaba = "FINISH_ONLY_WABA",
}

export type EmbeddedSignUpAuthorizedObject = {
  auth: EmbedSignUpLoginSuccess;
  signUp: EmbedSignUpObject;
};

export type EmbedSignupAbandonObject = {
  current_step: string;
};

export type EmbedSignupErrorObject = {
  error_id: string;
  error_message: string;
  session_id: string;
  timestamp: string;
};

export type EmbedSignUpExchangeToken = {
  access_token: string;
  token_type: "bearer";
};

export type EmbedSignUpLoginSuccess = {
  authResponse: {
    code: string;
    expiresIn?: null | string;
    userId: null | string;
  };
  status: string;
};

export type EmbedSignUpObject = {
  data:
    | EmbedSignupAbandonObject
    | EmbedSignupErrorObject
    | EmbedSignupSuccessObject;
  event: EmbedSignUpFlowEventType;
  type: "WA_EMBEDDED_SIGNUP";
};

export type EmbedSignupSuccessObject = {
  business_id: string;
  phone_number_id: string;
  waba_id: string;
};
