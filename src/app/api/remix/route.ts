import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { sourceProjectId, userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to remix a video. Please sign up first." },
        { status: 401 }
      );
    }

    if (!sourceProjectId) {
      return NextResponse.json(
        { error: "Source project ID is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // Fetch source project
    const { data: sourceProject, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", sourceProjectId)
      .single();

    if (projectError || !sourceProject) {
      return NextResponse.json(
        { error: "Source project not found." },
        { status: 404 }
      );
    }

    // Fetch source script
    const { data: sourceScript } = await supabase
      .from("scripts")
      .select("*")
      .eq("project_id", sourceProjectId)
      .single();

    // Clone the project
    const { data: newProject, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        title: `Remix: ${sourceProject.title}`,
        topic: sourceProject.topic,
        language: sourceProject.language,
        tone: sourceProject.tone,
        status: sourceScript ? "script" : "draft",
      })
      .select()
      .single();

    if (createError || !newProject) {
      console.error("Failed to create remix project:", createError);
      return NextResponse.json(
        { error: "Failed to create remix project." },
        { status: 500 }
      );
    }

    // Clone the script if it exists
    if (sourceScript) {
      const { error: scriptError } = await supabase.from("scripts").insert({
        project_id: newProject.id,
        hook: sourceScript.hook,
        body: sourceScript.body,
        cta: sourceScript.cta,
        full_text: sourceScript.full_text,
      });

      if (scriptError) {
        console.error("Failed to clone script:", scriptError);
      }
    }

    return NextResponse.json({ project: newProject });
  } catch (error) {
    console.error("Remix API error:", error);
    return NextResponse.json(
      { error: "Failed to remix project." },
      { status: 500 }
    );
  }
}
