import { z } from "zod";

export const SIGN_UP_METHODS = ["password", "google", "facebook"] as const;
// Declarations
export interface AuthUser {
  email_address: string;
  id: string;
  is_email_address_verified: boolean;
  name: string;
}

export type SignUpMethod = (typeof SIGN_UP_METHODS)[number];

type LoginResponse = AuthUser;
type SignUpResponse = AuthUser;

export const SignUpWithPasswordSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8).max(255),
});
export type SignUpWithPasswordPayload = z.infer<
  typeof SignUpWithPasswordSchema
>;
export type SignUpWithPasswordResponse = SignUpResponse;

// Login with email and password
export const LoginWithEmailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});
export type LoginWithEmailPasswordPayload = z.infer<
  typeof LoginWithEmailPasswordSchema
>;
export type LoginWithEmailPasswordResponse = LoginResponse;

// Login with username and password
export const LoginWithUsernamePasswordSchema = z.object({
  password: z.string().min(8).max(255),
  username: z.string(),
});
export type LoginWithUsernamePasswordPayload = z.infer<
  typeof LoginWithUsernamePasswordSchema
>;
export type LoginWithUsernamePasswordResponse = LoginResponse;

// Forgot password
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;
export type ForgotPasswordResponse = true;

// Reset password
export const ResetPasswordSchema = z.object({
  password: z.string().min(8).max(255),
  passwordAgain: z.string().min(8).max(255),
  token: z.string(),
});
export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordResponse = boolean;

// Send verify email
export const SendVerifyEmailTokenSchema = z.object({
  email_address: z.string(),
});
export type SendVerifyEmailTokenPayload = z.infer<
  typeof SendVerifyEmailTokenSchema
>;
export type SendVerifyEmailTokenResponse = true;

// Verify email
export const VerifyEmailSchema = z.object({
  token: z.string(),
});
export type VerifyEmailPayload = z.infer<typeof VerifyEmailSchema>;
export type VerifyEmailResponse = boolean;
