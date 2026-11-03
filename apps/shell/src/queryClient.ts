import { QueryClient } from "@tanstack/react-query";

// FR-01: the one and only QueryClient instance in the whole page
export const queryClient = new QueryClient();
