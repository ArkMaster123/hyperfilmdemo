import { GeneratedOutput } from '../skills/types';

export function wrapInHtmlDocument(bodyContent: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0a0a0a;
      color: #e4e4e7;
      line-height: 1.7;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .document-wrapper {
      max-width: 860px;
      margin: 0 auto;
      padding: 3rem 2rem 4rem;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: #fafafa;
      margin-bottom: 0.75rem;
      letter-spacing: -0.025em;
      line-height: 1.2;
      background: linear-gradient(135deg, #fafafa 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #fafafa;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      letter-spacing: -0.015em;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(167, 139, 250, 0.2);
    }

    h3 {
      font-size: 1.15rem;
      font-weight: 600;
      color: #d4d4d8;
      margin-top: 1.75rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin-bottom: 1rem;
      color: #a1a1aa;
    }

    .intro, .introduction {
      font-size: 1.1rem;
      color: #a1a1aa;
      margin-bottom: 2rem;
      padding: 1.25rem 1.5rem;
      background: rgba(167, 139, 250, 0.05);
      border-left: 3px solid #7c3aed;
      border-radius: 0 8px 8px 0;
    }

    .card, .prompt-card, .section, .prompt-section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
      transition: border-color 0.2s ease;
    }

    .card:hover, .prompt-card:hover, .section:hover, .prompt-section:hover {
      border-color: rgba(167, 139, 250, 0.25);
    }

    .card h3, .prompt-card h3, .section h3, .prompt-section h3 {
      margin-top: 0;
      color: #e4e4e7;
    }

    .prompt-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: #fff;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .prompt-text, pre, code {
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace;
    }

    .prompt-text {
      background: rgba(124, 58, 237, 0.08);
      border: 1px solid rgba(124, 58, 237, 0.15);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin: 0.75rem 0;
      font-size: 0.9rem;
      color: #c4b5fd;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    pre {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin: 0.75rem 0;
      overflow-x: auto;
      font-size: 0.85rem;
      line-height: 1.5;
    }

    code {
      background: rgba(124, 58, 237, 0.12);
      padding: 0.15em 0.4em;
      border-radius: 4px;
      font-size: 0.88em;
      color: #c4b5fd;
    }

    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: inherit;
      color: #d4d4d8;
    }

    .tip, .tips, .best-practice, .tip-box {
      background: rgba(34, 197, 94, 0.05);
      border-left: 3px solid #22c55e;
      border-radius: 0 8px 8px 0;
      padding: 0.75rem 1rem;
      margin: 0.75rem 0;
      font-size: 0.9rem;
      color: #86efac;
    }

    .tip::before, .tip-box::before {
      content: "Tip: ";
      font-weight: 600;
      color: #4ade80;
    }

    .warning-box {
      background: rgba(234, 179, 8, 0.05);
      border-left: 3px solid #eab308;
      border-radius: 0 8px 8px 0;
      padding: 0.75rem 1rem;
      margin: 0.75rem 0;
      font-size: 0.9rem;
      color: #fde68a;
    }

    .warning-box::before {
      content: "Warning: ";
      font-weight: 600;
      color: #facc15;
    }

    .explanation {
      color: #a1a1aa;
      font-size: 0.95rem;
      margin: 0.5rem 0;
    }

    blockquote {
      border-left: 3px solid #7c3aed;
      padding: 0.75rem 1.25rem;
      margin: 1.5rem 0;
      background: rgba(124, 58, 237, 0.05);
      border-radius: 0 8px 8px 0;
    }

    blockquote p {
      color: #c4b5fd;
      margin-bottom: 0;
    }

    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }

    li {
      margin-bottom: 0.4rem;
      color: #a1a1aa;
    }

    li::marker {
      color: #7c3aed;
    }

    strong {
      color: #e4e4e7;
      font-weight: 600;
    }

    em {
      color: #c4b5fd;
      font-style: italic;
    }

    a {
      color: #a78bfa;
      text-decoration: none;
      border-bottom: 1px solid rgba(167, 139, 250, 0.3);
      transition: border-color 0.2s ease;
    }

    a:hover {
      border-color: #a78bfa;
    }

    hr {
      border: none;
      height: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin: 2rem 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    th {
      color: #fafafa;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td {
      color: #a1a1aa;
    }

    .badge, .tag {
      display: inline-block;
      background: rgba(124, 58, 237, 0.15);
      color: #a78bfa;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2em 0.65em;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      text-align: center;
      font-size: 0.8rem;
      color: #52525b;
    }

    @media (max-width: 640px) {
      .document-wrapper {
        padding: 1.5rem 1rem 2rem;
      }
      h1 {
        font-size: 1.75rem;
      }
      h2 {
        font-size: 1.25rem;
      }
    }
  </style>
</head>
<body>
  <div class="document-wrapper">
    ${bodyContent}
    <div class="footer">Generated by DigiForge</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function createHtmlOutput(
  rawHtml: string,
  inputs: Record<string, any>,
): Promise<GeneratedOutput> {
  const title = inputs.topic ? `${inputs.topic} - Prompt Guide` : 'Generated Document';
  const fullHtml = wrapInHtmlDocument(rawHtml, title);
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html`;

  return {
    filename,
    contentType: 'text/html',
    data: Buffer.from(fullHtml, 'utf-8'),
    preview: fullHtml,
  };
}
