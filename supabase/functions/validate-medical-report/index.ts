import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportId } = await req.json();
    console.log('Validating medical report:', reportId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch report details
    const { data: report, error: reportError } = await supabase
      .from('health_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      throw new Error('Report not found');
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('health-reports')
      .download(report.file_url);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    // Convert file to base64 for AI analysis
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare validation prompt
    const validationPrompt = `You are a medical document classifier. Analyze this document and determine if it is a valid medical/health report.

A valid medical report typically contains:
- Laboratory test results (blood tests, urine tests, etc.)
- Medical parameters (CBC, liver function, kidney function, glucose levels, etc.)
- Patient information and test dates
- Medical terminology and measurements
- Hospital/lab letterhead or identifiers

Invalid documents include:
- Resumes or CVs
- General text documents
- Personal photos or images
- Business documents
- Non-medical PDFs

Respond with ONLY "VALID" if this is a medical report, or "INVALID" if it is not.`;

    // Call Lovable AI for validation
    const aiPayload: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: validationPrompt
        }
      ]
    };

    // Add image content if it's an image file
    if (report.file_type.startsWith('image/')) {
      aiPayload.messages[0].content = [
        { type: "text", text: validationPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${report.file_type};base64,${base64}`
          }
        }
      ];
    }

    console.log('Calling Lovable AI for validation...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiPayload),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI validation error:', errorText);
      throw new Error('AI validation failed');
    }

    const aiResult = await aiResponse.json();
    const validationResult = aiResult.choices?.[0]?.message?.content?.trim().toUpperCase();

    console.log('Validation result:', validationResult);

    const isValid = validationResult === 'VALID';

    return new Response(
      JSON.stringify({ 
        isValid,
        message: isValid 
          ? 'Document is a valid medical report' 
          : 'This file doesn\'t appear to be a valid medical report. Please upload a proper medical report to analyze.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isValid: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
