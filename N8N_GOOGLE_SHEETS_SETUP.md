# n8n Google Sheets Lead Import

## 1. Prepare the Google Sheet

Use one header row with these exact column names:

```text
name,phone,whatsapp,email,source,campaign,interested_site_id,preferred_plot_size,budget,purpose,preferred_location,status
```

Only `name` and `phone` are required. If `whatsapp` is blank, the workflow copies `phone` automatically.

Allowed `source` values:

```text
Google
Meta
WhatsApp
Website
Referral
Channel Partner
Other
```

Allowed `status` values:

```text
NEW
CONTACTED
FOLLOW UP
SITE VISIT
INTERESTED
NEGOTIATION
BOOKED
REGISTRATION COMPLETED
LOST
```

Example row:

| name | phone | whatsapp | email | source | campaign | status |
|---|---|---|---|---|---|---|
| Arun Kumar | 9876543210 | 9876543210 | arun@example.com | Google | Chennai Plots | NEW |

## 2. Import the workflow

1. Open n8n.
2. Select **Workflows > Import from File**.
3. Import `n8n-google-sheets-leads-workflow.json`.
4. Open **Google Sheets - New Lead Row**.
5. Select or create your Google Sheets OAuth credential.
6. Replace the spreadsheet ID and tab name with your values.

The spreadsheet ID is the text between `/d/` and `/edit` in the Google Sheets URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## 3. Configure Supabase

Open **Supabase - Upsert Lead** and replace:

- `REPLACE_WITH_SUPABASE_PROJECT_REF` with the project reference from your Supabase URL.
- Both service-role key placeholders with the Supabase service-role key.

The service-role key must stay inside n8n credentials and must not be added to the React app or committed to Git.

The request writes to:

```text
POST https://YOUR_PROJECT_REF.supabase.co/rest/v1/leads?on_conflict=id
```

The workflow uses the phone number to generate a stable lead ID. Repeating the same phone number updates the existing lead instead of creating a duplicate.

## 4. Test the workflow

1. Click **Execute Workflow** or activate the workflow.
2. Add a new row to the Google Sheet.
3. Confirm that the n8n execution succeeds.
4. Check the `leads` table in Supabase.
5. Refresh the CRM to load the new lead.

The CRM reads data from Supabase when it starts. The current implementation requires a refresh after n8n inserts a new row.
