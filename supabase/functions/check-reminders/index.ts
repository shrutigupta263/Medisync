import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  reminder_type: string;
  reminder_time: string;
  is_completed: boolean;
}

interface Profile {
  email: string;
  full_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for reminders to send...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Get current time and 5 minutes from now
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

    console.log('Checking reminders between:', now.toISOString(), 'and', fiveMinutesFromNow.toISOString());

    // Get reminders that need to be sent (not completed, time is within next 5 minutes)
    const { data: reminders, error: remindersError } = await supabase
      .from('health_reminders')
      .select('*')
      .eq('is_completed', false)
      .gte('reminder_time', now.toISOString())
      .lte('reminder_time', fiveMinutesFromNow.toISOString());

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} reminders to send`);

    if (!reminders || reminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const reminder of reminders as Reminder[]) {
      try {
        // Get user profile to get email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', reminder.user_id)
          .single();

        if (profileError || !profile) {
          console.error('Error fetching profile for user:', reminder.user_id, profileError);
          results.push({
            reminder_id: reminder.id,
            status: 'failed',
            error: 'User profile not found'
          });
          continue;
        }

        const typedProfile = profile as Profile;
        const reminderTime = new Date(reminder.reminder_time);
        const formattedTime = reminderTime.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        });

        // Prepare email content based on reminder type
        const subject = reminder.reminder_type === 'medicine' 
          ? `💊 Medicine Reminder: ${reminder.title}`
          : `📅 Appointment Reminder: ${reminder.title}`;

        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Hello ${typedProfile.full_name || 'there'}! 👋</h2>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">
                ${reminder.reminder_type === 'medicine' ? '💊 Medicine Time!' : '📅 Appointment Reminder'}
              </h3>
              <p style="font-size: 18px; font-weight: bold; color: #1e3a8a; margin: 10px 0;">
                ${reminder.title}
              </p>
              ${reminder.description ? `
                <p style="color: #475569; margin: 10px 0;">
                  ${reminder.description}
                </p>
              ` : ''}
              <p style="color: #64748b; font-size: 14px; margin: 10px 0;">
                ⏰ Scheduled for: ${formattedTime}
              </p>
            </div>

            ${reminder.reminder_type === 'medicine' ? `
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e;">
                  <strong>💡 Reminder:</strong> Take your medication as prescribed. If you have any questions, consult your healthcare provider.
                </p>
              </div>
            ` : `
              <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>💡 Tip:</strong> Make sure to arrive 10-15 minutes early for your appointment.
                </p>
              </div>
            `}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
              <p>This is an automated reminder from your Health Management System.</p>
              <p>If you've already completed this task, you can mark it as done in the app.</p>
            </div>
          </div>
        `;

        // Send email
        console.log(`Sending email to ${typedProfile.email} for reminder ${reminder.id}`);
        
        const emailResult = await resend.emails.send({
          from: 'Health Reminders <onboarding@resend.dev>',
          to: [typedProfile.email],
          subject: subject,
          html: emailBody,
        });

        if (emailResult.error) {
          console.error('Error sending email:', emailResult.error);
          results.push({
            reminder_id: reminder.id,
            status: 'failed',
            error: emailResult.error
          });
        } else {
          console.log('Email sent successfully:', emailResult);
          
          // Mark reminder as completed
          await supabase
            .from('health_reminders')
            .update({ is_completed: true })
            .eq('id', reminder.id);

          results.push({
            reminder_id: reminder.id,
            status: 'sent',
            email_id: emailResult.data?.id
          });
        }

      } catch (error) {
        console.error('Error processing reminder:', reminder.id, error);
        results.push({
          reminder_id: reminder.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    console.log('Reminder check complete. Results:', results);

    return new Response(
      JSON.stringify({
        message: 'Reminder check complete',
        total: reminders.length,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in check-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
