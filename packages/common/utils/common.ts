import { randomBytes } from "crypto";

export const createResourceName = (name: string, stage: string) => {
  return `standora-${stage || "dev"}-${name}`;
};

export const generateIdWithPrefix = ({ prefix }: { prefix: string }) => {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
};
