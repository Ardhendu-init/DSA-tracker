# Progress Tracker

## 02-design-filter.md

### Features

- [x] Move all existing filters inside the Questions Table header section (search + tag + sort now live in table header)
- [x] Remove the Platform filter completely
- [x] Add a Confidence filter directly beside the Confidence column header (inline `<select>` in `<th>`)
- [x] Tags: Show only first 2 tags in table; "+N more" button opens detail modal
- [x] Move search inside the Questions Table header

### Good Practices

- [ ] Firebase Security: restrict API key in Google Cloud Console to allowed domains only
- [ ] Configure Firestore security rules — paste the following in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/questions/{questionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
