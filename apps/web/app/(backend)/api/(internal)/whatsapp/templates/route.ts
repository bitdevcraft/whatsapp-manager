import { getTemplates } from "@/features/whatsapp/templates/get-template";
import { db } from "@workspace/db/config";
import { NextRequest, NextResponse } from "next/server";
import { withTenantTransaction } from "@workspace/db/tenant";
import { templatesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getUserWithTeam } from "@/lib/db/queries";
import type { TemplateResponse } from "@workspace/wa-cloud-api/features/template/types";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sync = searchParams.get("sync");

  try {
    const result = await getTemplates(!!sync);
    return new NextResponse(JSON.stringify(result), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch templates",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
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
          error: "Unauthorized: No team found",
          details: "User is not associated with a team"
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Parse the request body
    let templateData;
    try {
      templateData = (await request.json()) as Omit<TemplateResponse, 'id' | 'status' | 'category'> & {
        name: string;
        category: string;
      };
    } catch (parseError) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body",
          details: "Failed to parse JSON payload"
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Generate a new template ID
    const templateId = `template_${uuidv4()}`;
    
    try {
            // Create the template with Meta status
      const templateContent: TemplateResponse = {
        ...templateData,
        meta: {
          status: 'DRAFT',
          createdAt: new Date().toISOString()
        } as any, // Temporary any to avoid type issues
        // Ensure required fields from TemplateResponse are included
        id: templateId,
        status: 'PENDING',
        parameter_format: templateData.parameter_format || 'NAMED',
        components: templateData.components || []
      };

      // Create the template in the database
      const [newTemplate] = await withTenantTransaction(userWithTeam.teamId, async (tx) => {
        return tx
          .insert(templatesTable)
          .values({
            id: templateId,
            name: templateData.name,
            content: templateContent as any, // Temporary any to avoid type issues
            teamId: userWithTeam.teamId!,
            updatedAt: new Date(),
          })
          .returning();
      });

      return new NextResponse(JSON.stringify(newTemplate), { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (dbError) {
      console.error("Database error creating template:", dbError);
      return new NextResponse(
        JSON.stringify({ 
          error: "Failed to create template",
          details: dbError instanceof Error ? dbError.message : 'Unknown error' 
        }), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in template creation:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
