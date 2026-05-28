# Task Updates for Questions Table

## Features to Implement

1. Move all existing filters inside the Questions Table header section.
   - Use dropdown-based filters.
   - Remove the Platform filter completely.

2. Add a Confidence filter directly beside the Confidence column in the table.

3. Tags UI Improvement:
   - Show only the first two tags by default.
   - Add a “Show More” capability.
   - Remaining tags should only be visible when the preview box/modal is opened.

4. Add a search functionality inside the Questions Table.
   - Search should work dynamically across relevant question fields.

---

# Good Practices / Improvements

1. Firebase Security
   - Check whether Firebase keys are being exposed publicly.
   - If sensitive configuration or secrets are exposed incorrectly, move them to environment variables.
   - Follow proper Firebase security practices and ensure Firestore rules are configured correctly.
