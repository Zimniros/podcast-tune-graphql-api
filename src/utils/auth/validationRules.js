import { string, object, ref } from 'yup';

const emailRequired = 'Email is required';
const passwordRequired = 'Password is required';
const passwordNotLongEnough = 'Password must be at least 9 characters';
const invalidEmail = "Email isn't valid";
const confirmPasswordRequired = 'Password confirmation is required';
const confirmPasswordMismatch = 'Passwords must match';

const emailRule = string()
  .min(3)
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
