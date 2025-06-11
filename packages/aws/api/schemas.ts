import { z } from "zod";
import { UserAuthType } from "../dynamo-db/models/user";

export const signUpSchema = z
  .object({
    fullName: z.string(),
    email: z.string().email(),
    authType: z.nativeEnum(UserAuthType),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.authType === UserAuthType.Credentials && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password is required when authType is Credentials",
        path: ["password"],
      });
    }
  });
