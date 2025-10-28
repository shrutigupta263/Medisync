import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, reportContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a specialized medical health assistant. Your ONLY purpose is to answer questions related to:
- Health reports and medical test results
- Medical parameters and their meanings (CBC, liver function, kidney function, glucose, etc.)
- Symptoms and health conditions
- Medical terminology explanations
- General health and wellness topics
- Preventive care and lifestyle recommendations related to health

STRICT RULES:
1. ONLY answer medical and health-related questions
2. If a question is NOT about medicine, health, symptoms, medical reports, or wellness, respond with: "I'm here to help with medical-related questions only. Please ask something related to your health report."
3. Keep responses short, clear, and factual (2-3 sentences maximum)
4. Never provide personal medical advice or diagnosis
5. Never answer questions about: entertainment, coding, general knowledge, sports scores, weather, politics, or any non-medical topics
6. If unsure whether a question is medical, err on the side of declining to answer

${reportContext ? `\n\nCONTEXT: The user has uploaded a health report. Here's the summary:\n${reportContext}` : ''}`;

    console.log('Calling Lovable AI for health chat...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI chat error:', errorText);
      throw new Error('Failed to get AI response');
    }

    const aiResult = await aiResponse.json();
    const reply = aiResult.choices?.[0]?.message?.content || 'Unable to generate response';

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Health chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
