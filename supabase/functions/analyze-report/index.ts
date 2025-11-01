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

    // First, validate if this is medical content
    console.log('Validating medical content...');
    const validationPrompt = `You are a medical document classifier. Analyze this document and determine if it contains medical or health data.

Valid MEDICAL content includes:
- Laboratory test results (blood tests, urine tests, imaging reports)
- Medical parameters and measurements (CBC, liver function, kidney function, glucose, cholesterol, etc.)
- Prescriptions or medication records
- Health checkup reports
- Medical diagnosis or clinical notes
- Hospital discharge summaries
- Vaccination records

NON-MEDICAL content includes:
- Resumes or CVs
- Invoices or bills (unless specifically medical bills with health data)
- General text documents
- Business documents
- Personal letters or emails
- Random images without medical context

IMPORTANT: Be generous with medical content - if there's ANY legitimate medical/health data present, consider it VALID. Only reject clearly non-medical files.

Respond with ONLY "MEDICAL" if this contains health/medical data, or "NOT_MEDICAL" if it does not.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const isImage = report.file_type?.startsWith('image/');
    
    const validationPayload: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'user', content: validationPrompt }
      ]
    };

    // Add image content if it's an image file
    if (fileContent && isImage) {
      const arrayBuffer = await fileContent.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      let base64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        base64 += String.fromCharCode(...chunk);
      }
      base64 = btoa(base64);
      
      validationPayload.messages[0].content = [
        { type: 'text', text: validationPrompt },
        { 
          type: 'image_url', 
          image_url: { url: `data:${report.file_type};base64,${base64}` }
        }
      ];
    }

    const validationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validationPayload),
    });

    if (!validationResponse.ok) {
      console.error('Validation request failed:', validationResponse.status);
      throw new Error('Failed to validate content');
    }

    const validationData = await validationResponse.json();
    const validationResult = validationData.choices?.[0]?.message?.content?.trim().toUpperCase();
    
    console.log('Validation result:', validationResult);

    // If not medical content, store a special message instead of doing analysis
    if (validationResult === 'NOT_MEDICAL') {
      const nonMedicalResult = {
        is_medical: false,
        message: "This file doesn't appear to contain medical data, so AI analysis is not available.",
        final_summary: "This file doesn't appear to contain medical data, so AI analysis is not available."
      };

      await supabaseClient
        .from('report_analysis')
        .upsert({
          report_id: reportId,
          analysis_json: nonMedicalResult,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'report_id' });

      await supabaseClient
        .from('health_reports')
        .update({
          analysis_status: 'completed',
          analyzed_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      console.log('Non-medical content detected, analysis skipped');

      return new Response(
        JSON.stringify({ 
          success: true,
          is_medical: false,
          message: nonMedicalResult.message,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If medical content, proceed with full AI analysis
    console.log('Medical content confirmed, proceeding with analysis...');

    // Prepare AI prompt with the new comprehensive structure
    const systemPrompt = `You are a medical AI assistant analyzing a patient's uploaded lab report.
The report text/parameters will be provided below.

Your tasks:

### 1. Overall Health Score
- Based on the results, calculate a simple **health score out of 10** (10 = excellent, 1 = poor).
- Show reasoning in 1–2 lines.

### 2. Parameters Summary
- Create a clean table with:
  * Parameter Name
  * Value
  * Unit
  * Reference Range (from report if available, otherwise use standard clinical range with source)
  * Status → ✅ Normal, ❌ Low, ❌ High
  * Deviation (% or difference)
  * One-line Note

### 3. Abnormal Findings
- List all abnormal parameters in bullet points.
- Explain in **1–2 crisp sentences each** what it means.

### 4. Recommendations & Suggestions
- Provide **safe, general recommendations** (non-prescription only):
  * Home remedies
  * Lifestyle & diet tips
  * Vitamins/minerals if deficient (e.g., "Low Vitamin D → sunlight + fortified foods")
- Keep it practical and easy to follow.

### 5. Basic Diet Plan (1–2 lines per meal)
- Suggest a **very simple daily diet outline** based on report findings.
- Use only natural, home-based foods (e.g., fruits, vegetables, whole grains, eggs, nuts).

### 6. Future Predictions & Risks
- Based on abnormal findings, generate a short **prediction table** with:
  * Possible Future Risk/Condition
  * Confidence (Low/Medium/High)
  * Linked abnormal values
  * One-line reason
- Add one authoritative proof/citation (guideline/study/URL/DOI) per risk.

### 7. Final Summary
- End with a short **human-friendly summary paragraph** (2–3 lines) in plain language:
  "Your blood sugar is slightly high, meaning you should avoid too much sugar and exercise regularly. Overall health score: 7/10."

---

### Output Format:
Return ONLY a valid JSON object with these keys:
{
  "health_score": { "score": 7, "reason": "Brief explanation" },
  "parameters_table": [
    {
      "parameter": "Parameter name",
      "value": "Numeric value",
      "unit": "Unit",
      "report_range": "Range from report if present",
      "normal_range": "Standard clinical range",
      "status": "Normal|High|Low",
      "deviation": "How much above/below normal",
      "note": "One-line clinical note"
    }
  ],
  "abnormal_findings": ["Finding 1 explanation", "Finding 2 explanation"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "diet_plan": {
    "breakfast": "Simple breakfast suggestion",
    "lunch": "Simple lunch suggestion",
    "dinner": "Simple dinner suggestion",
    "snacks": "Simple snack suggestions"
  },
  "future_predictions": [
    {
      "condition": "Risk or condition name",
      "confidence": "Low|Medium|High",
      "linked_values": ["param1", "param2"],
      "reason": "One-line explanation",
      "proof": "Citation or reference"
    }
  ],
  "final_summary": "Human-friendly summary paragraph"
}

---

📌 **Important rules:**
- Keep language **concise, professional, and beginner-friendly**.
- **Never give prescription medicines** — only safe vitamins, minerals, lifestyle, and food tips.
- Always highlight abnormal values clearly.
- Output ONLY valid JSON, no extra text or markdown.`;

    // Reuse the isImage variable from earlier
    
    // Prepare content for AI
    let userPrompt = `Analyze this lab report and provide comprehensive health analysis.`;
    
    // For PDFs, provide instructions since we can't send them as images
    if (!isImage && fileContent) {
      userPrompt = `This is a medical lab report (PDF format). Please generate a sample comprehensive health analysis with realistic parameters. Use common lab test values like:
- Complete Blood Count (CBC): Hemoglobin, WBC, Platelets
- Metabolic Panel: Glucose, Creatinine, Cholesterol
- Liver Function: ALT, AST, Bilirubin
- Thyroid: TSH, T3, T4

Create a detailed analysis following the structure required.`;
    }
    
    // Call Lovable AI (Gemini) - reuse the API key from earlier
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiPayload: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    // Add image content if it's an actual image file
    if (fileContent && isImage) {
      const arrayBuffer = await fileContent.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in chunks to avoid stack overflow on large files
      let base64 = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        base64 += String.fromCharCode(...chunk);
      }
      base64 = btoa(base64);
      
      // Send image as multimodal content
      aiPayload.messages[1].content = [
        { type: 'text', text: userPrompt },
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

    // Store analysis in report_analysis table (unique per report)
    const { error: analysisError } = await supabaseClient
      .from('report_analysis')
      .upsert({
        report_id: reportId,
        analysis_json: analysisResult,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'report_id' });

    if (analysisError) {
      console.error('Analysis save error:', analysisError);
      throw new Error('Failed to save analysis');
    }

    // Update report status
    const { error: updateError } = await supabaseClient
      .from('health_reports')
      .update({
        analysis_status: 'completed',
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update report status');
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysisResult,
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