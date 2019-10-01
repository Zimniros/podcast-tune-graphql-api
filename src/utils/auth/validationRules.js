import { string, object } from 'yup';

const emailRequired = 'Email is required';
const passwordRequired = 'Password is required';
const passwordNotLongEnough = 'Password must be at least 9 characters';
const invalidEmail = "Email isn't valid";

export const emailRule = string()
  .min(3)
  .max(255)
  .email(invalidEmail)
  .required(emailRequired);

export const passwordRule = string()
  .min(9, passwordNotLongEnough)
  .max(255)
  .required(passwordRequired);

export const validUserSchema = object().shape({
  email: emailRule,
  password: passwordRule,
});
