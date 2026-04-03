import z from "zod";

export const ArtworkStatus = z.enum([
    "IN_HOME",
    "IN_STORAGE",
    "ON_LOAN",
    "IN_EXHIBITION",
], { error: () => ({ message: "Status must be one of: IN_HOME, IN_STORAGE, ON_LOAN, IN_EXHIBITION" }) });

export const Currency = z.enum(["USD", "VND"], { error: "Must select one of: USD, VND" });