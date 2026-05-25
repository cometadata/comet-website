# Join Us form — Mailchimp setup

This guide explains how to connect the `/join-us/` page form to a Mailchimp audience. The form is implemented as a hosted Mailchimp signup form: the site posts directly to Mailchimp’s subscribe endpoint using field names from your audience configuration.

## Overview

| Item | Location |
|---|---|
| Page | `/join-us/` |
| Form content & Mailchimp IDs | `data/join_us/form.yaml` |
| Form template | `themes/comet-theme/layouts/partials/blocks/form-stack.html` |
| Page layout | `themes/comet-theme/layouts/_default/join-us.html` |

The form block does **not** display a “Join Us” heading. The page hero (`data/join_us/hero.yaml`) provides the main page title. The form block shows only the intro paragraph and the form itself.

Submissions open in a new tab (`target="_blank"`) and are handled by Mailchimp’s standard signup flow.

## Step 1: Create or choose a Mailchimp audience

1. Log in to [Mailchimp](https://mailchimp.com/).
2. Go to **Audience** and select the audience that should receive Join Us signups (or create a new one).

## Step 2: Create audience fields (merge fields)

Create the following **text** audience fields in Mailchimp. Mark them as **visible on the signup form** if you want to verify them in Mailchimp’s form builder (recommended while setting up).

| Label in Mailchimp | Purpose | Required on site |
|---|---|---|
| Email Address | Contact email | Yes |
| First Name | First name | Yes |
| Last Name | Surname | Yes |
| Primary affiliation | Primary affiliation | Yes |
| Secondary affiliation | Secondary affiliation | No |
| LinkedIn | LinkedIn profile URL or handle | No |
| Join community | Community participation interest | No (defaults to `No`) |
| Project collaborations | Project collaboration interest | No (defaults to `No`) |

For the two participation fields, Mailchimp should store plain text values **`Yes`** or **`No`**. These are suitable for audience segments, for example:

- **Join community is Yes**
- **Project collaborations is Yes**

### Creating merge fields in Mailchimp

1. Open your audience → **Settings** → **Audience fields and merge tags**.
2. Add each custom field with an appropriate type (Text).
3. Note the **merge tag** for each field (e.g. `MMERGE3`, `MMERGE4`, or a custom tag name depending on your audience).

Default Mailchimp fields typically use:

- `EMAIL`
- `FNAME`
- `LNAME`

Custom fields often appear as `MMERGE3`, `MMERGE4`, etc., but **always use the exact tag shown in your account** — numbering can differ between audiences.

## Step 3: Build an embedded signup form in Mailchimp

1. Go to **Audience** → **Signup forms** → **Form builder** (or **Other forms** → **Embedded forms**).
2. Create an embedded form that includes all fields listed above.
3. Save the form, then **view the form source** (or copy the embed code and inspect the HTML).

From the hosted form HTML, collect:

| Value | Where to find it |
|---|---|
| **Post URL** | `<form action="...">` — e.g. `https://yourdomain.us21.list-manage.com/subscribe/post` |
| **User ID** | Hidden input `name="u"` value |
| **List / audience ID** | Hidden input `name="id"` value |
| **Field names** | Each input’s `name` attribute (e.g. `EMAIL`, `FNAME`, `MMERGE6`) |

Mailchimp’s help article: [Host your own signup forms](https://mailchimp.com/help/host-your-own-signup-forms/)

## Step 4: Update `data/join_us/form.yaml`

Replace the placeholder values with the IDs and field names from your Mailchimp form source.

```yaml
content: "Please take a minute to let us know how you’d like to be involved and we’ll be in touch."

mailchimp:
  post_url: "https://yourdomain.us21.list-manage.com/subscribe/post"
  user_id: "your_user_id_from_hidden_u_field"
  list_id: "your_list_id_from_hidden_id_field"
  fields:
    email: "EMAIL"
    first_name: "FNAME"
    last_name: "LNAME"
    primary_affiliation: "MMERGE3"      # match your Mailchimp tag
    secondary_affiliation: "MMERGE4"
    linkedin: "MMERGE5"
    join_community: "MMERGE6"            # Mailchimp label: "Join community"
    project_collaborations: "MMERGE7"   # Mailchimp label: "Project collaborations"

participation:
  - label: "Join community"
    checkbox_label: "Receive updates"
    field: "join_community"
  - label: "Participate in project collaborations"
    checkbox_label: "Receive updates"
    field: "project_collaborations"
```

### Field mapping reference

The keys under `mailchimp.fields` are internal site keys. Each value must be the **exact** `name` attribute Mailchimp expects in the POST request.

| Site key | Form label on `/join-us/` |
|---|---|
| `email` | Email* |
| `first_name` | First name* |
| `last_name` | Surname* |
| `primary_affiliation` | Primary affiliation* |
| `secondary_affiliation` | Secondary affiliation |
| `linkedin` | LinkedIn |
| `join_community` | Join community → Receive updates |
| `project_collaborations` | Participate in project collaborations → Receive updates |

The `participation` list controls the visible labels and checkbox text only. Each item’s `field` key must match a key under `mailchimp.fields`.

## Step 5: How participation checkboxes submit Yes / No

Each participation option uses a **hidden input** that always submits to Mailchimp, plus a **checkbox** for the user interface.

| Checkbox state | Value sent to Mailchimp |
|---|---|
| Unchecked | `No` |
| Checked | `Yes` |

This ensures Mailchimp always receives an explicit value for segmentation, even when the user leaves a box unchecked.

After updating YAML, rebuild the site and test a submission. In Mailchimp, confirm the contact record shows `Yes` or `No` on the participation merge fields.

## Step 6: Create Mailchimp segments (optional)

Once signups are flowing, create segments based on the participation fields, for example:

1. **Audience** → **Segments** → **Create segment**.
2. Add a condition such as **Join community** **is** **Yes**.
3. Repeat for **Project collaborations** as needed.

You can combine conditions (e.g. both Yes, either Yes, etc.) depending on how you plan outreach.

## Step 7: Test the form

1. Run the site locally and open `/join-us/`.
2. Submit the form with test data.
3. Confirm Mailchimp shows the new contact with all merge fields populated.
4. Test both participation checkboxes:
   - Submit with both unchecked → both fields should be `No`.
   - Submit with one or both checked → corresponding field(s) should be `Yes`.
5. Check that the honeypot field (hidden, off-screen) is empty — Mailchimp uses this for bot protection.

## Editing intro copy

To change the paragraph above the form (without adding a block title), edit the `content` field in `data/join_us/form.yaml`. Markdown is supported.

## Troubleshooting

| Problem | What to check |
|---|---|
| Form submits but contact is not created | Verify `user_id`, `list_id`, and `post_url` match the Mailchimp embed code exactly |
| Some fields missing on the contact | Compare each `mailchimp.fields` value with the `name` attributes in Mailchimp’s form source |
| Participation always blank | Ensure the merge field accepts text and that values `Yes` / `No` are allowed |
| Wrong datacenter in URL | The post URL subdomain (e.g. `us21`) must match your Mailchimp account region |
| Double opt-in not triggered | Controlled in Mailchimp audience settings, not in the Hugo form |

## Security note

Do not commit real Mailchimp API keys to this repository. The join form uses the public hosted signup endpoint and audience/list IDs only — no API key is required for form submissions.
