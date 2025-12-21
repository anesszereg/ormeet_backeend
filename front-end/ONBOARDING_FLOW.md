# Onboarding Flow Integration

## Overview
The onboarding flow has been fully integrated with the backend authentication system. Users now complete onboarding **before** logging in, ensuring a seamless registration experience.

## Flow Sequence

### 1. **Landing Page** (`/`)
- Redirects to `/onboarding-choice`
- First page users see when visiting the app

### 2. **Onboarding Choice** (`/onboarding-choice`)
- User selects their role:
  - **Attend events** (Attendee)
  - **Organize events** (Organizer)
- Selection stored in `localStorage` as `userType`
- Navigates to `/onboarding-organizer`

### 3. **Onboarding Organizer** (`/onboarding-organizer`)
- User chooses signup method:
  - Email
  - Phone
  - Google OAuth (TODO)
  - Facebook OAuth (TODO)
- Navigates to `/onboarding-signup` with method parameter

### 4. **Onboarding Signup** (`/onboarding-signup`)
- **Backend Integration**: ✅
- User enters credentials:
  - Email/Phone (based on selection)
  - Password (min 8 characters)
- Calls `POST /auth/register` endpoint
- Creates user account with:
  - Role: `attendee` or `organizer`
  - Email verification token generated
  - JWT token returned
- Stores:
  - `pendingVerification`: email/phone for verification
  - `verificationType`: 'email' or 'phone'
- Navigates to `/email-confirmation`

### 5. **Email Confirmation** (`/email-confirmation`)
- **Backend Integration**: ✅
- Displays 6-digit verification code input
- Shows identifier (email/phone) from `localStorage`
- **Verify Code**: Calls `POST /auth/verify-code`
  - Validates 6-digit code
  - Marks email/phone as verified
  - Max 3 attempts, 10-minute expiry
- **Resend Code**: Calls `POST /auth/send-verification-code`
- On success:
  - Clears verification data from `localStorage`
  - Routes based on `userType`:
    - Organizers → `/onboarding-brand-info`
    - Attendees → `/onboarding-interests`

### 6A. **Onboarding Brand Info** (`/onboarding-brand-info`) - For Organizers
- **Backend Integration**: ✅
- Collects organizer information:
  - Organization name
  - Event types hosted
  - Events per year
  - Average attendees
- Stores data in `localStorage` as `onboardingData`
- Clears `userType` from `localStorage`
- Navigates to `/login` with success message

### 6B. **Onboarding Interests** (`/onboarding-interests`) - For Attendees
- **Backend Integration**: ✅
- Collects attendee preferences:
  - Event categories (Music, Sports, Tech, etc.)
  - Specific subtypes within categories
- Stores data in `localStorage` as `onboardingData`
- Clears `userType` from `localStorage`
- Navigates to `/login` with success message

### 7. **Login** (`/login`)
- **Backend Integration**: ✅
- Displays success message: "Registration complete! Please log in to continue."
- User logs in with credentials
- Calls `POST /auth/login`
- On success, redirects to dashboard

## Backend API Endpoints Used

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login with email/phone and password
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/send-verification-code` - Send 6-digit code
- `POST /auth/verify-code` - Verify 6-digit code

### User Data
- User entity includes:
  - `roles`: Array of user roles
  - `interestedEventCategories`: For attendees
  - `hostingEventTypes`: For organizers
  - `emailVerified`: Boolean flag
  - `phoneVerified`: Boolean flag

## LocalStorage Data Flow

### During Onboarding
1. `userType`: 'attend' or 'organize' (from choice page)
2. `pendingVerification`: Email/phone awaiting verification
3. `verificationType`: 'email' or 'phone'
4. `onboardingData`: Collected preferences/info

### After Registration
- `token`: JWT authentication token
- `user`: User object with profile data

### Cleanup
- All onboarding-specific data cleared after completion
- Only auth data persists for logged-in session

## Error Handling

All onboarding pages include:
- Loading states during API calls
- Error message display
- Form validation
- Disabled submit buttons during processing
- User-friendly error messages

## Features

### Security
- Password validation (min 8 characters)
- Email/phone verification required
- JWT token-based authentication
- Secure password hashing (bcrypt)

### User Experience
- Progress bars showing completion status
- Auto-focus on next input field (verification code)
- Paste support for verification codes
- Resend code functionality
- Clear error and success messages
- Responsive design for all screen sizes

### Backend Integration
- Full API integration with NestJS backend
- Proper error handling and validation
- Token management via AuthContext
- Automatic token injection in API requests

## Testing the Flow

1. Visit `http://localhost:5173/` (or your dev URL)
2. Select user type (Attend or Organize)
3. Choose signup method (Email or Phone)
4. Enter credentials and submit
5. Check backend console for verification code
6. Enter 6-digit code
7. Complete profile information
8. Login with credentials
9. Access dashboard

## Future Enhancements

- [ ] Google OAuth integration
- [ ] Facebook OAuth integration
- [ ] SMS verification for phone numbers
- [ ] Profile photo upload during onboarding
- [ ] Skip verification option for development
- [ ] Onboarding progress persistence across sessions
- [ ] A/B testing for onboarding variations

## Notes

- Backend must be running on `http://localhost:3000` (or configured API URL)
- Email service must be configured for verification emails
- For development, verification codes are logged to backend console
- Phone verification requires SMS provider integration (Twilio, AWS SNS, etc.)
