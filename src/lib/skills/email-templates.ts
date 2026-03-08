import { z } from 'zod';
import { SkillConfig, GeneratedOutput } from './types';
import { wrapInHtmlDocument } from '../output/html-pipeline';

const inputSchema = z.object({
  businessType: z
    .string()
    .min(2, 'Business type must be at least 2 characters')
    .max(100, 'Business type must be under 100 characters')
    .describe('Type of business (e.g., SaaS, E-commerce, Restaurant)'),
  emailPurpose: z
    .enum(['welcome', 'newsletter', 'promotional', 'follow-up', 'announcement'])
    .describe('Purpose of the email templates'),
  brandColor: z
    .string()
    .default('#6366f1')
    .describe('Primary brand color in hex format'),
  companyName: z
    .string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be under 100 characters')
    .describe('Name of the company'),
});

const systemPrompt = `You are an expert email designer and marketing specialist. You create professional, production-ready HTML email templates.

OUTPUT FORMAT: You must output ONLY raw HTML content. Do NOT include <!DOCTYPE>, <html>, <head>, or <body> tags. Start directly with the content.

GENERATE 3-5 COMPLETE HTML EMAIL TEMPLATES. Each template must:
1. Use TABLE-BASED LAYOUT ONLY — no flexbox, no CSS grid. Email clients do not support modern CSS layout.
2. Use INLINE CSS ONLY — no <style> blocks, no external stylesheets. Every style must be on the element itself.
3. Be MOBILE-RESPONSIVE using width="100%" on tables and max-width via style attribute.
4. Apply the provided brand color prominently (headers, buttons, accents).
5. Include realistic placeholder content — real-sounding names, dates, product details. Not lorem ipsum.

STRUCTURE EACH TEMPLATE EXACTLY LIKE THIS:
<div class="email-template" data-template-name="Template Name Here">
  <h3 style="margin-bottom: 8px;">Template Name</h3>
  <p class="explanation">Brief description of when to use this template.</p>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; font-family: Arial, Helvetica, sans-serif;">
    <!-- Full email content here using nested tables for layout -->
  </table>
</div>

DESIGN REQUIREMENTS:
- Each template should have a header area with the company name/logo placeholder
- A main content area with the email body
- A clear call-to-action button styled with the brand color (use table-based button, not <a> alone)
- A footer with unsubscribe link, company address placeholder, and social media placeholders
- Use background colors via bgcolor attribute on table cells (not CSS background)
- Text should be readable: 14-16px body text, sufficient line-height
- Ensure adequate padding using cellpadding or spacer cells
- Button design: use a table cell with bgcolor set to the brand color, with a centered <a> tag inside

VARIETY: Make each template distinct in layout and content approach. Vary the structure — some with hero images (use placeholder), some text-focused, some with multi-column product grids (using nested tables).

Do NOT include any markdown — output pure HTML only.
Do NOT wrap output in code fences or backticks.`;

async function createEmailHtmlOutput(
  rawHtml: string,
  inputs: Record<string, any>,
): Promise<GeneratedOutput> {
  const title = `${inputs.companyName} - ${inputs.emailPurpose} Email Templates`;
  const fullHtml = wrapInHtmlDocument(rawHtml, title);
  const filename = `${inputs.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${inputs.emailPurpose}-email-templates.html`;

  return {
    filename,
    contentType: 'text/html',
    data: Buffer.from(fullHtml, 'utf-8'),
    preview: fullHtml,
  };
}

export const emailTemplatesSkill: SkillConfig = {
  id: 'email-templates',
  name: 'Email Template Pack',
  description:
    'Create professional HTML email templates with table-based layouts, inline CSS, and mobile-responsive design ready for any email platform.',
  difficulty: 'easy',
  icon: '📧',
  category: 'Marketing',
  inputSchema,
  systemPrompt,
  outputFormat: 'html',
  outputPipeline: createEmailHtmlOutput,
};
