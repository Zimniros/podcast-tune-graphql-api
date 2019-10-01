import { string, object, ref } from 'yup';
import {
  emailRequired,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough,
  passwordRequired,
  confirmPasswordRequired,
  confirmPasswordMismatch,
} from './messages';

const emailRule = string()
  .min(3, emailNotLongEnough)
  .max(255)
  .email(invalidEmail)
  .required(emailRequired);

const passwordRule = string()
  .min(9, passwordNotLongEnough)
  .max(255)
  .required(passwordRequired);

const confirmPasswordRule = string()
  .required(confirmPasswordRequired)
  .oneOf([ref('password')], confirmPasswordMismatch);

export const validUserSchema = object().shape({
  email: emailRule,
  password: passwordRule,
});

export const validRequestSchema = object().shape({
  email: emailRule,
});

export const validResetSchema = object({
  password: passwordRule,
  confirmPassword: confirmPasswordRule,
});
