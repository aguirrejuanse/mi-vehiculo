import { z } from "zod";

// Shared uuid guard for route params / FormData ids before they hit a uuid
// column — a malformed value can never match, so queries bail early instead
// of letting Postgres throw "invalid input syntax".
export const idSchema = z.uuid();
