import { z } from "zod";

export const interests = [
  "VPS",
  "VDS",
  "Remote desktop",
  "Object storage",
  "Dedicated servers",
  "Game servers",
  "IP transit",
  "BGP",
  "IP leasing",
  "Colocation",
  "Web hosting",
  "Discord bot hosting",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z
    .string()
    .trim()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."),
  organisation: z.string().trim().max(120).optional().default(""),
  interest: z.enum(interests, { message: "Choose a service." }),
  message: z
    .string()
    .trim()
    .min(20, "Add a few more details about the workload.")
    .max(4000),
  companyWebsite: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
