const REQUIRED_FIELDS = ['firstName', 'lastName', 'email', 'phone', 'projectType', 'serviceNeeded', 'message'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value) => String(value || '').trim();

const parseBody = (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  return {};
};

const buildLeadText = (lead) => {
  const rows = [
    ['Name', `${lead.firstName} ${lead.lastName}`],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['ZIP Code', lead.zipCode || 'Not provided'],
    ['Project Type', lead.projectType],
    ['Service Needed', lead.serviceNeeded],
    ['How They Heard About Us', lead.referralSource || 'Not provided'],
    ['Contact Consent', lead.contactConsent ? 'Yes' : 'No'],
    ['Message', lead.message],
  ];

  return rows.map(([label, value]) => `${label}: ${value}`).join('\n');
};

const sendLeadEmail = async ({ lead, toEmail, fromEmail, apiKey }) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `New estimate request from ${lead.firstName} ${lead.lastName}`,
      text: buildLeadText(lead),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed: ${details}`);
  }
};

const sendLeadSms = async ({ lead, toPhone, accountSid, authToken, fromPhone }) => {
  const body = new URLSearchParams({
    To: toPhone,
    From: fromPhone,
    Body: `New estimate request: ${lead.firstName} ${lead.lastName}, ${lead.phone}, ${lead.projectType}. Email: ${lead.email}`,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Twilio SMS failed: ${details}`);
  }
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body;
  try {
    body = parseBody(req);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid JSON request body.' });
  }

  const lead = {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    email: clean(body.email),
    phone: clean(body.phone),
    zipCode: clean(body.zipCode),
    projectType: clean(body.projectType),
    serviceNeeded: clean(body.serviceNeeded),
    referralSource: clean(body.referralSource),
    message: clean(body.message),
    contactConsent: Boolean(body.contactConsent),
  };

  const missingFields = REQUIRED_FIELDS.filter((field) => !lead[field]);
  if (missingFields.length) {
    return res.status(400).json({
      error: 'Please complete all required fields.',
      missingFields,
    });
  }

  if (!EMAIL_PATTERN.test(lead.email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const toEmail = process.env.LEAD_TO_EMAIL || 'allamericantilesllc@gmail.com';
  const toPhone = process.env.LEAD_TO_PHONE || '7346577965';
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  const missingEmailEnv = [];
  if (!resendApiKey) missingEmailEnv.push('RESEND_API_KEY');
  if (!fromEmail) missingEmailEnv.push('EMAIL_FROM');

  if (missingEmailEnv.length) {
    return res.status(500).json({
      error: 'Lead email is not configured.',
      missingEnvironmentVariables: missingEmailEnv,
      requiredInVercel: ['RESEND_API_KEY', 'EMAIL_FROM'],
      optionalInVercel: ['LEAD_TO_EMAIL', 'LEAD_TO_PHONE', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_PHONE'],
    });
  }

  try {
    await sendLeadEmail({ lead, toEmail, fromEmail, apiKey: resendApiKey });

    const smsConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_PHONE);
    if (smsConfigured) {
      await sendLeadSms({
        lead,
        toPhone,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromPhone: process.env.TWILIO_FROM_PHONE,
      });
    }

    return res.status(200).json({
      ok: true,
      emailSent: true,
      smsSent: smsConfigured,
      smsConfigured,
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Lead notification failed.',
      detail: error.message,
    });
  }
};
