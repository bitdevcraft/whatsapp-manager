import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream([
    {
      level: "info",
      stream: pino.transport({
        target: "pino/file",
        options: {
          destination: 1, // stdout
          mkdir: true,
        },
      }),
    },
    {
      level: "error",
      stream: pino.transport({
        target: "pino/file",
        options: {
          destination: "./logs/campaign-errors.log",
          mkdir: true,
        },
      }),
    },
    {
      level: "debug",
      stream: pino.transport({
        target: isDevelopment ? "pino-pretty" : "pino/file",
        options: isDevelopment
          ? {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
            }
          : {
              destination: "./logs/campaign-debug.log",
              mkdir: true,
            },
      }),
    },
  ])
);

export type CampaignLogContext = {
  marketingCampaignId?: string;
  teamId?: string;
  userId?: string;
  recipientPhone?: string;
  jobId?: string;
  wamid?: string;
  errorType?: string;
  errorCode?: string;
};

export class CampaignLogger {
  constructor(private baseContext: CampaignLogContext) {}

  private withContext(additionalContext: Partial<CampaignLogContext>) {
    return { ...this.baseContext, ...additionalContext };
  }

  info(message: string, additionalContext?: Partial<CampaignLogContext>) {
    logger.info(this.withContext(additionalContext || {}), message);
  }

  error(message: string, error: Error | unknown, additionalContext?: Partial<CampaignLogContext>) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error(
      {
        ...this.withContext(additionalContext || {}),
        err: {
          message: errorObj.message,
          stack: errorObj.stack,
          name: errorObj.name,
        },
      },
      message
    );
  }

  warn(message: string, additionalContext?: Partial<CampaignLogContext>) {
    logger.warn(this.withContext(additionalContext || {}), message);
  }

  debug(message: string, additionalContext?: Partial<CampaignLogContext>) {
    logger.debug(this.withContext(additionalContext || {}), message);
  }
}

export function createCampaignLogger(context: CampaignLogContext): CampaignLogger {
  return new CampaignLogger(context);
}
