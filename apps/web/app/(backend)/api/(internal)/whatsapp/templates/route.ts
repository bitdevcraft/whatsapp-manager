import type { TemplateResponse } from "@workspace/wa-cloud-api";

import { templatesTable } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { CategoryEnum } from "@workspace/wa-cloud-api";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { getTemplates } from "@/features/whatsapp/templates/get-template";
import { getUserWithTeam } from "@/lib/db/queries";

// Extend the TemplateResponse type to include meta
interface AppTemplateResponse extends Omit<TemplateResponse, "meta"> {
  meta?: {
    createdAt: string;
    status: string;
  };
}

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sync = searchParams.get("sync");

  const userWithTeam = await getUserWithTeam();
  if (!userWithTeam?.teamId) {
    return new NextResponse(
      JSON.stringify({
        details: "User is not associated with a team",
        error: "Unauthorized: No team found",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 401,
      }
    );
  }

  try {
    const result = await getTemplates(!!sync);

    revalidateTag(`templates:select:${userWithTeam?.teamId}`);
    revalidateTag(`templates:${userWithTeam?.teamId}`);

    return new NextResponse(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new NextResponse(
      JSON.stringify({
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to fetch templates",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user and team
    const userWithTeam = await getUserWithTeam();
    if (!userWithTeam?.teamId) {
      return new NextResponse(
        JSON.stringify({
          details: "User is not associated with a team",
          error: "Unauthorized: No team found",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 401,
        }
      );
    }

    // Parse the request body
    let templateData;
    try {
      templateData = (await request.json()) as Omit<
        TemplateResponse,
        "category" | "id" | "status"
      > & {
        category: string;
        name: string;
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return new NextResponse(
        JSON.stringify({
          details: "Failed to parse JSON payload",
          error: "Invalid request body",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 400,
        }
      );
    }

    // Generate a new template ID
    const templateId = `template_${uuidv4()}`;

    try {
      // Create the template with Meta status
      // Validate and cast category to CategoryEnum
      const category = Object.values(CategoryEnum).includes(
        templateData.category as CategoryEnum
      )
        ? (templateData.category as CategoryEnum)
        : CategoryEnum.Marketing; // Default to MARKETING if invalid

      const templateContent: AppTemplateResponse = {
        ...templateData,
        category, // Use validated category
        components: templateData.components || [],
        // Ensure required fields from TemplateResponse are included
        id: templateId,
        meta: {
          createdAt: new Date().toISOString(),
          status: "DRAFT",
        },
        parameter_format: templateData.parameter_format || "NAMED",
        status: "PENDING",
      };

      // Create the template in the database
      const [newTemplate] = await withTenantTransaction(
        userWithTeam.teamId,
        async (tx) => {
          return tx
            .insert(templatesTable)
            .values({
              content: templateContent,
              id: templateId,
              name: templateData.name,
              teamId: userWithTeam.teamId!,
              updatedAt: new Date(),
            })
            .returning();
        }
      );

      return new NextResponse(JSON.stringify(newTemplate), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 201,
      });
    } catch (dbError) {
      console.error("Database error creating template:", dbError);
      return new NextResponse(
        JSON.stringify({
          details: dbError instanceof Error ? dbError.message : "Unknown error",
          error: "Failed to create template",
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in template creation:", error);
    return new Response(
      JSON.stringify({
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Internal server error",
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
}
