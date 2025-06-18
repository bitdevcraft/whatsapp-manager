export type EmbedSignUpObject = {
  data:
    | EmbedSignupSuccessObject
    | EmbedSignupAbandonObject
    | EmbedSignupErrorObject;
  type: "WA_EMBEDDED_SIGNUP";
  event: EmbedSignUpFlowEventType;
};

export type EmbedSignupSuccessObject = {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
};

export type EmbedSignupAbandonObject = {
  current_step: string;
};

export type EmbedSignupErrorObject = {
  error_message: string;
  error_id: string;
  session_id: string;
  timestamp: string;
};

export enum EmbedSignUpFlowEventType {
  Finish = "FINISH",
  FinishOnlyWaba = "FINISH_ONLY_WABA",
  FinishOnboarding = "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
  Cancel = "CANCEL",
}

export type EmbedSignUpLoginSuccess = {
  authResponse: {
    code: string;
    expiresIn?: string | null;
    userId: string | null;
  };
  status: string;
};

export type EmbedSignUpExchangeToken = {
  access_token: string;
  token_type: "bearer";
};

export type EmbeddedSignUpAuthorizedObject = {
  signUp: EmbedSignUpObject;
  auth: EmbedSignUpLoginSuccess;
};
