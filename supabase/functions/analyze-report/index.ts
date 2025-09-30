import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    console.log('Analyzing report:', reportId);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch report details
    const { data: report, error: fetchError } = await supabaseClient
      .from('health_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      console.error('Report fetch error:', fetchError);
      throw new Error('Report not found');
    }

    // Download file from storage
    let fileContent: Blob | null = null;
    if (report.file_url) {
      const { data: fileData, error: downloadError } = await supabaseClient.storage
        .from('health-reports')
        .download(report.file_url);
      
      if (downloadError) {
        console.error('File download error:', downloadError);
      } else {
        fileContent = fileData;
      }
    }

    // Prepare AI prompt
    const systemPrompt = `You are an AI medical lab report analyzer. Your task is to:
1. Extract all lab parameters, values, units, and reference ranges from the report
2. Analyze each parameter against standard clinical ranges
3. Identify abnormalities and provide concise medical insights
4. Generate predictions for potential health conditions based on abnormal values

Output ONLY a valid JSON object with this exact structure:
{
  "ocr_text": "full extracted text from report",
  "analysis_table": [
    {
      "parameter": "Parameter name",
      "value": "Numeric value",
      "unit": "Unit",
      "report_range": "Range from report if present",
      "normal_range": "Standard clinical range",
      "status": "Normal|High|Low",
      "deviation": "How much above/below normal",
      "note": "One-line clinical note",
      "ocr_snippet": "Exact text from report"
    }
  ],
  "prediction_table": [
    {
      "condition": "Condition or risk name",
      "confidence": "Low|Medium|High",
      "linked_values": ["param1", "param2"],
      "reason_one_line": "Brief mechanism explanation",
      "proof_citation": "Study/guideline reference"
    }
  ]
}`;

    // Prepare content for AI based on file type
    let userContent = `Analyze this lab report: ${report.title}\nFile type: ${report.file_type}`;
    
    if (fileContent && report.file_type?.includes('image')) {
      // For images, convert to base64
      const arrayBuffer = await fileContent.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      userContent = `Analyze this lab report image. Extract all lab parameters, values, and reference ranges.`;
    }

    // Call Lovable AI (Gemini)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiPayload: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    };

    // Add image if available
    if (fileContent && report.file_type?.includes('image')) {
      const arrayBuffer = await fileContent.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      aiPayload.messages[1].content = [
        { type: 'text', text: userContent },
        { 
          type: 'image_url', 
          image_url: { url: `data:${report.file_type};base64,${base64}` }
        }
      ];
    }

    console.log('Calling Lovable AI Gateway...');
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
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');
    
    const aiContent = aiData.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('No content in AI response');
    }

    // Parse AI response
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      const jsonContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('AI content:', aiContent);
      throw new Error('Failed to parse AI analysis');
    }

    // Update report with analysis
    const { error: updateError } = await supabaseClient
      .from('health_reports')
      .update({
        ocr_text: analysisResult.ocr_text || '',
        analysis_data: analysisResult.analysis_table || [],
        prediction_data: analysisResult.prediction_table || [],
        analysis_status: 'completed',
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to save analysis');
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis_data: analysisResult.analysis_table,
        prediction_data: analysisResult.prediction_table,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-report:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});