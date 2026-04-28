type LogLevel = "info" | "warn" | "error";

type LogPrimitive = string | number | boolean | null;
type LogValue = LogPrimitive | readonly LogPrimitive[];

export type LogResult =
  | "succeeded"
  | "rejected"
  | "blocked"
  | "failed"
  | "recovered";

export type LogContext = {
  [key: string]: LogValue | undefined;
  area: string;
  action: string;
  result: LogResult;
  reason?: string;
  actorUserId?: string;
  role?: string;
  projectId?: string;
  taskId?: string;
  repositoryConnectionId?: string;
  detail?: string;
};

type ErrorWithCode = Error & {
  code?: unknown;
};

const reservedKeys = new Set(["timestamp", "level", "event"]);

function getErrorFields(error: unknown): Record<string, LogValue | undefined> {
  if (error === undefined) {
    return {};
  }
  if (error instanceof Error) {
    const errorWithCode = error as ErrorWithCode;

    return {
      errorName: error.name,
      errorMessage: error.message,
      errorCode:
        typeof errorWithCode.code === "string" ||
        typeof errorWithCode.code === "number"
          ? String(errorWithCode.code)
          : undefined,
    };
  }

  if (typeof error === "string") {
    return {
      errorMessage: error,
    };
  }

  return {
    errorMessage: "unknown_error",
  };
}

function compactFields(
  fields: Record<string, LogValue | undefined>,
): Record<string, LogValue> {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([key, value]) => value !== undefined && !reservedKeys.has(key),
    ),
  ) as Record<string, LogValue>;
}

function emit(
  level: LogLevel,
  event: string,
  context: LogContext,
  error?: unknown,
) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...compactFields({
      ...context,
      ...getErrorFields(error),
    }),
  };

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

export const logger = {
  info(event: string, context: LogContext) {
    emit("info", event, context);
  },
  warn(event: string, context: LogContext) {
    emit("warn", event, context);
  },
  error(event: string, context: LogContext, error?: unknown) {
    emit("error", event, context, error);
  },
};
