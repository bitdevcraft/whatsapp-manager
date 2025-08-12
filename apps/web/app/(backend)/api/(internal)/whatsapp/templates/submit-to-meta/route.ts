/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import axios from "axios";
import { AppTemplateResponse, TemplateMeta } from "@/types/template";
import { withTenantTransaction } from "@workspace/db/tenant";
import { getUserWithTeam } from "@/lib/db/queries";
import WhatsApp from "@workspace/wa-cloud-api";
import { decryptApiKey } from "@/lib/crypto";
import { templatesTable } from "@workspace/db/schema/templates";

export const runtime = "nodejs";

type TemplateSubmissionResponse = {
  success: boolean;
  message: string;
  template?: {
    id: string;
    name: string;
    status: string;
    meta?: TemplateMeta;
  };
  error?: string;
  details?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    // Parse request body
    const templateData = await request.json();

    // Get user and team information for tenant context
    const userWithTeam = await getUserWithTeam();

    if (!userWithTeam?.teamId) {
      throw new Error("User is not associated with a team");
    }

    const teamId = userWithTeam.teamId;

    // Get the existing template to update its content within tenant transaction
    const existingTemplate = await withTenantTransaction(teamId, async (tx) => {
      // First try to find by ID
      let template = await tx
        .select()
        .from(templatesTable)
        .where(
          and(
            eq(templatesTable.id, templateData.id),
            eq(templatesTable.teamId, teamId),
            isNull(templatesTable.deletedAt)
          )
        )
        .limit(1)
        .then((rows) => rows[0]);

      // If not found by ID, try to find by name as fallback
      if (!template) {
        template = await tx
          .select()
          .from(templatesTable)
          .where(
            and(
              eq(templatesTable.name, templateData.name || ""),
              eq(templatesTable.teamId, teamId),
              isNull(templatesTable.deletedAt)
            )
          )
          .limit(1)
          .then((rows) => rows[0]);
      }

      if (!template) {
        const newTemplate = {
          id: templateData.id,
          name: templateData.name,
          content: templateData.content,
          teamId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await tx.insert(templatesTable).values(newTemplate);
        return newTemplate;
      }

      return template;
    });

    // Get WhatsApp Business Account configuration with phone number
    const account = await withTenantTransaction(teamId, async (tx) => {
      return await tx.query.whatsAppBusinessAccountsTable.findFirst({
        where: (accounts, { eq }) => eq(accounts.teamId, teamId),
        with: {
          team: {
            with: {
              waBusinessPhoneNumber: true,
            },
          },
        },
      });
    });

    if (!account) {
      throw new Error("No WhatsApp Business Account found for this team");
    }

    // Ensure account is properly typed after the null check
    const verifiedAccount = account;

    // Get the first verified phone number
    const phoneNumber = verifiedAccount.team?.waBusinessPhoneNumber?.[0];
    if (!phoneNumber?.id || !phoneNumber.isRegistered) {
      throw new Error(
        "No verified phone number found for this WhatsApp Business Account. Please register a phone number first."
      );
    }

    // At this point, we know phoneNumber is defined and has an id
    const verifiedPhoneNumber = phoneNumber;

    if (
      !verifiedAccount.accessToken?.iv ||
      !verifiedAccount.accessToken?.data
    ) {
      throw new Error("WhatsApp Business Account not properly configured");
    }

    // Decrypt the access token
    const accessToken = await decryptApiKey({
      iv: verifiedAccount.accessToken.iv,
      data: verifiedAccount.accessToken.data,
    });

    // Create a custom Axios instance for v22.0
    const axiosInstance = axios.create({
      baseURL: "https://graph.facebook.com/v22.0",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    // Add request interceptor to log requests
    axiosInstance.interceptors.request.use((request) => {
      return request;
    });

    // Add response interceptor to log responses
    axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response) {
          console.error("Meta API error response:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          console.error("No response received from Meta API:", error.request);
        } else {
          console.error("Error setting up Meta API request:", error.message);
        }
        return Promise.reject(error);
      }
    );

    // Initialize WhatsApp client with our custom HTTP client
    const whatsapp = new (class extends WhatsApp {
      constructor() {
        super({
          accessToken,
          businessAcctId: verifiedAccount.id.toString(),
          phoneNumberId: verifiedPhoneNumber.id,
          // @ts-expect-error - Private property access needed to fix the issue
          httpClient: axiosInstance,
        });
        // @ts-expect-error - Override private property
        this.baseUrl = "https://graph.facebook.com/v22.0";
      }
    })();

    // Submit template to Meta

    try {
      // Pass the required configuration directly
      const result = await submitTemplateToMeta(whatsapp, existingTemplate, {
        accessToken,
        businessAccountId: account.id.toString(),
      });

      if (!result?.id) {
        throw new Error("Invalid response from Meta API: Missing template ID");
      }

      // Update the template's content with Meta submission info
      const updatedContent: AppTemplateResponse = {
        ...existingTemplate.content,
        id: existingTemplate.content?.id || templateData.name,
        meta: {
          ...(existingTemplate.content?.meta || {}),
          status: "PENDING",
          id: result.id,
          submittedAt: new Date().toISOString(),
        },
      };

      // Update the template in our database with the new content within tenant transaction
      const updatedTemplate = await withTenantTransaction(
        teamId,
        async (tx) => {
          const [updatedTemplate] = await tx
            .update(templatesTable)
            .set({
              content: updatedContent as any, // Type assertion needed due to Drizzle type complexity
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(templatesTable.id, existingTemplate.id),
                eq(templatesTable.teamId, teamId)
              )
            )
            .returning();

          return updatedTemplate;
        }
      );

      if (!updatedTemplate) {
        throw new Error("Failed to update template with Meta submission info");
      }

      const response: TemplateSubmissionResponse = {
        success: true,
        message: "Template submitted to Meta for approval",
        template: {
          id: updatedTemplate.id,
          name: updatedTemplate.name,
          status: updatedContent.meta?.status || "PENDING",
          meta: updatedContent.meta,
        },
      };

      return NextResponse.json(response);
    } catch (error: unknown) {
      let errorMessage = "Failed to submit template to Meta";
      let errorDetails: Record<string, unknown> = {};

      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = {
          name: error.name,
          stack: error.stack,
          ...(error as any).details,
        };
      } else if (typeof error === "object" && error !== null) {
        errorDetails = { ...error };
      }

      console.error("Error in template submission to Meta:", {
        message: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      });

      const response: TemplateSubmissionResponse = {
        success: false,
        message: errorMessage,
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? errorDetails : undefined,
      };

      return NextResponse.json(response, { status: 500 });
    }
  } catch (error: unknown) {
    let errorMessage = "Failed to submit template to Meta";
    let errorDetails: Record<string, unknown> = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack,
        ...(error as any).details,
      };
    } else if (typeof error === "object" && error !== null) {
      errorDetails = { ...error };
    }

    console.error("Error in template submission to Meta:", {
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
    });

    const response: TemplateSubmissionResponse = {
      success: false,
      message: errorMessage,
      error: errorMessage,
      details:
        process.env.NODE_ENV === "development" ? errorDetails : undefined,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

async function submitTemplateToMeta(
  whatsapp: WhatsApp,
  templateData: any,
  config: {
    accessToken: string;
    businessAccountId: string;
  }
): Promise<{ id: string }> {
  const { accessToken, businessAccountId } = config;

  if (!accessToken || !businessAccountId) {
    throw new Error(
      `Missing required configuration. Access Token: ${accessToken ? "Present" : "Missing"}, Business Account ID: ${businessAccountId ? "Present" : "Missing"}`
    );
  }

  // Prepare template data for Meta API v22.0 - minimal version
  // Prepare template data for Meta API v22.0 - exactly matching Meta's example
  // Prepare template data for Meta API v22.0 - exactly matching Meta's example
  const template = {
    name: templateData.content.name,
    language: templateData.content.language || "en",
    category: templateData.content.category || "MARKETING",
    components: templateData.content.components || [],
  };

  try {
    const url = `https://graph.facebook.com/v22.0/${businessAccountId}/message_templates`;

    const response = await axios.post(url, template, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      timeout: 30000,
    });

    if (!response.data || !response.data.id) {
      throw new Error("Invalid response from Meta API: Missing template ID");
    }

    return { id: response.data.id };
  } catch (error: any) {
    console.error("Direct Meta API error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });

    throw new Error(
      `Failed to create template in Meta: ${
        error.response?.data?.error?.message ||
        error.response?.data?.error?.error_user_msg ||
        error.message ||
        "Unknown error"
      }`
    );
  }
}
