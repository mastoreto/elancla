import { requestId as honoRequestId } from "hono/request-id";

export const REQUEST_ID_HEADER = "X-Request-Id";

export const requestId = honoRequestId({ headerName: REQUEST_ID_HEADER });
