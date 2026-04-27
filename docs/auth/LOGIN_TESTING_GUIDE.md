# 🧪 TESTING CHECKLIST - Login & Register Module

**Date:** April 27, 2026  
**Module:** Authentication System (Login & Register Views)  
**Status:** Ready for Visual Testing

---

## 🚀 Getting Started

```bash
# Terminal 1 - Start development server
npm run dev

# Terminal 2 - Alternative: Build and serve
npm run build
npm run preview

# Then visit:
# http://localhost:5173/login
# http://localhost:5173/register
```

---

## 📱 Desktop Testing (1920px+)

### Visual Structure
- [ ] Left column: Integra360 branding visible
  - [ ] Logo and "Gestión Empresarial Integral" text
  - [ ] 3 benefits cards (Rápido, Seguro, Escalable)
  - [ ] Animated gradient blobs in background
  
- [ ] Right column: Login/Register form
  - [ ] Clear title ("Bienvenido" / "Crear Cuenta")
  - [ ] Subtitle text visible
  - [ ] Form fields properly aligned
  - [ ] Buttons at bottom

### Form Fields - Login
- [ ] Email input
  - [ ] Placeholder: "tu@email.com"
  - [ ] Border color: ink-black-200 (light)
  - [ ] Focus border: brick-ember-500 (red)
  - [ ] Focus ring: 4px brick-ember-200 (light red bg)
  
- [ ] Password input
  - [ ] Placeholder: "••••••••"
  - [ ] Eye icon on right side
  - [ ] Eye toggle: click to show/hide password
  - [ ] Same border/focus styling as email

- [ ] Checkbox "Recuérdame"
  - [ ] Visible to left of password field
  - [ ] Toggle functionality works
  
- [ ] "¿Olvidaste tu contraseña?" link
  - [ ] Right-aligned above button
  - [ ] Color: brick-ember-600
  - [ ] Hover: brick-ember-700

### Form Fields - Register  
- [ ] Full Name input
  - [ ] Placeholder: "Juan Pérez"
  - [ ] Same styling as Login
  
- [ ] Email input (same as Login)

- [ ] Password input (same as Login)
  - [ ] Eye icon toggles visibility

- [ ] Confirm Password input
  - [ ] Same styling
  - [ ] Separate eye icon for independent toggle
  
- [ ] Terms checkbox
  - [ ] "Acepto los Términos de Servicio y Política de Privacidad"
  - [ ] Links are brick-ember-600 color
  - [ ] Links underline on hover

### Buttons & Actions
- [ ] Login button
  - [ ] Text: "Iniciar Sesión"
  - [ ] Background: gradient brick-ember-600 → night-bordeaux-700
  - [ ] Text color: white
  - [ ] Hover effect: shadow-xl + darker gradient
  - [ ] Click effect: scale-95 (press feedback)
  
- [ ] Register button (on Register view)
  - [ ] Text: "Crear Cuenta"
  - [ ] Same styling as Login
  
- [ ] Register link (on Login view)
  - [ ] Text: "Crear Nueva Cuenta"
  - [ ] White background
  - [ ] Border: brick-ember-600
  - [ ] Text color: brick-ember-600
  - [ ] Hover: bg-brick-ember-50
  
- [ ] Login link (on Register view)
  - [ ] Same styling as Register link
  - [ ] Text: "Iniciar Sesión"

- [ ] Home link (both views)
  - [ ] Text: "Volver al Inicio"
  - [ ] Underline decoration
  - [ ] Hover: darker text

### Error Messages
- [ ] Invalid email shows: "Ingresa un correo electrónico válido"
- [ ] Empty email shows: "El correo electrónico es requerido"
- [ ] Empty password shows: "La contraseña es requerida"
- [ ] Short password (< 6 chars) shows: "La contraseña debe tener al menos 6 caracteres"
- [ ] Error messages appear below field
- [ ] Error color: night-bordeaux-600
- [ ] Error icon visible in field

### Loading State
- [ ] Click Login/Register button with valid form
  - [ ] Button text changes to "Autenticando..." / "Creando cuenta..."
  - [ ] Spinner icon appears (animated)
  - [ ] Button is disabled (opacity-50)
  - [ ] Cannot click button multiple times

### Server Error Display
- [ ] Invalid credentials show error box
  - [ ] Red/bordeaux background
  - [ ] Error icon visible
  - [ ] Error message readable
  - [ ] Can close by fixing form and retrying

### Navigation
- [ ] Click "Crear Nueva Cuenta" → goes to /register ✓
- [ ] Click "Iniciar Sesión" (from register) → goes to /login ✓
- [ ] Click "Volver al Inicio" → goes to / ✓
- [ ] Back button in browser works ✓

---

## 📱 Tablet Testing (640px - 1024px)

### Layout Changes
- [ ] Left branding column is **HIDDEN** (responsive)
- [ ] Form takes full width
- [ ] Form is centered with max-width: 448px
- [ ] Still readable and functional

### Touch Targets
- [ ] All buttons are > 44px tall ✓
- [ ] Input fields are > 44px tall ✓
- [ ] Checkboxes are easy to tap ✓

---

## 📱 Mobile Testing (< 640px)

### Single Column Layout
- [ ] Entire view is single column
- [ ] Form takes up full width (with padding)
- [ ] No horizontal scroll
- [ ] Title and form are visible
- [ ] Buttons are full width

### Form Inputs
- [ ] Email field:
  - [ ] Full width (- padding)
  - [ ] Text is readable (not zoomed)
  - [ ] Keyboard doesn't hide form
  
- [ ] Password field:
  - [ ] Full width
  - [ ] Eye icon is tappable
  - [ ] Password toggle works on small screens

### Mobile Navigation
- [ ] Links are large enough to tap
- [ ] Register/Login links stack vertically
- [ ] "Volver al Inicio" is visible
- [ ] Divider text is readable

### Keyboard Behavior
- [ ] Email keyboard: @ symbol visible
- [ ] Password keyboard: input is masked
- [ ] Pressing enter on last field submits form
- [ ] Tab order is logical (left to right)

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all inputs (email → password → checkbox → button)
- [ ] Shift+Tab goes backwards
- [ ] Space/Enter toggles checkbox
- [ ] Enter on button submits form
- [ ] Eye icon button is reachable with Tab

### Focus Indicators
- [ ] All inputs show focus ring when tabbed
- [ ] Focus ring is visible (not hidden)
- [ ] Focus ring color is brick-ember
- [ ] Button shows focus ring on Tab

### Screen Reader (NVDA/JAWS)
- [ ] Page title announced correctly
- [ ] Labels associated with inputs
- [ ] Error messages announced with aria-live (or shown immediately)
- [ ] Button state announced (disabled)
- [ ] Eye icon has aria-label: "Mostrar contraseña" / "Ocultar contraseña"

### Color Contrast
- [ ] Text on white background: ✓ (WCAG AA minimum)
- [ ] Error text (night-bordeaux): ✓ visible
- [ ] Button text on gradient: ✓ readable
- [ ] No critical info conveyed by color alone

---

## 🎨 Animation Testing

### Blur Movement Detection
- [ ] If user has "prefers-reduced-motion: reduce":
  - [ ] Blob animations are disabled
  - [ ] Fade transitions are disabled
  - [ ] Interactive animations still work (hover)

### Normal Animations
- [ ] Blob animations cycle smoothly (7s loop)
- [ ] No janky movement or stuttering
- [ ] Fade-in for error messages (300ms)
- [ ] Button hover shadow appears smooth
- [ ] Loading spinner rotates smoothly

### Performance
- [ ] No lag when typing in inputs
- [ ] Hover effects respond immediately
- [ ] Click feedback (scale-95) is instant
- [ ] Page scrolling is smooth

---

## 🔐 Functional Testing

### Validation Rules

**Email:**
- [ ] Empty field shows error ✓
- [ ] Invalid format (no @) shows error ✓
- [ ] Valid email (test@example.com) no error ✓
- [ ] Error clears on blur once valid ✓

**Password:**
- [ ] Empty field shows error ✓
- [ ] Less than 6 chars shows error ✓
- [ ] 6+ chars shows no error ✓
- [ ] Error clears when meets requirement ✓

**Confirm Password (Register):**
- [ ] Empty field shows error ✓
- [ ] Doesn't match password shows error ✓
- [ ] Matches password shows no error ✓

**Full Name (Register):**
- [ ] Empty shows error ✓
- [ ] Less than 3 chars shows error ✓
- [ ] 3+ chars shows no error ✓

**Terms Checkbox (Register):**
- [ ] Unchecked → button disabled ✓
- [ ] Checked → button enabled ✓
- [ ] Must be checked to submit ✓

### Form Submit Behavior

**Valid Login Form:**
- [ ] All fields green/valid
- [ ] Button is enabled (full opacity)
- [ ] Click submit → loading state
- [ ] Spinner appears
- [ ] Button text changes
- [ ] (API call would happen here)

**Invalid Login Form:**
- [ ] Missing email → button disabled
- [ ] Missing password → button disabled
- [ ] Invalid email → button disabled
- [ ] Short password → button disabled

**Password Visibility Toggle:**
- [ ] Default: password is masked (dots)
- [ ] Click eye → password visible as text
- [ ] Click eye again → password masked
- [ ] Works independently on Register's confirm field

**Remember Me (Login):**
- [ ] Checkbox can be toggled
- [ ] State persists during page interaction
- [ ] (Backend would handle persistence)

---

## 🌐 Browser Compatibility

- [ ] Chrome/Chromium: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile Chrome: All features work
- [ ] Mobile Safari: All features work

---

## 📊 Performance Metrics

```bash
# Run Lighthouse audit
# Chrome DevTools → Lighthouse → Generate Report

Target Scores:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90
```

---

## 🔗 Navigation Testing

### From Navbar
- [ ] Click "Iniciar Sesión" button in navbar → /login ✓
- [ ] Click "Registrarse" button in navbar → /register ✓

### Cross-Navigation
- [ ] /login → Click "Crear Nueva Cuenta" → /register ✓
- [ ] /register → Click "Iniciar Sesión" → /login ✓
- [ ] Both views → Click "Volver al Inicio" → / ✓

### Browser History
- [ ] Back button works from login
- [ ] Forward button works
- [ ] Refresh page preserves view

---

## ✅ Final Checklist

- [ ] All visual elements match design system
- [ ] Responsive on mobile, tablet, desktop
- [ ] All validations working
- [ ] Error messages clear and helpful
- [ ] Animations smooth (respects prefers-reduced-motion)
- [ ] Accessible with keyboard
- [ ] Accessible with screen reader
- [ ] Color contrast meets WCAG AA
- [ ] Forms submit properly
- [ ] Navigation works
- [ ] No console errors
- [ ] No TypeScript errors

---

## 🎯 Known Limitations (Expected)

1. **Backend Integration Not Yet Implemented**
   - Login/Register will fail (no backend endpoint)
   - Will show: "No response from server" error
   - Expected behavior once backend is ready

2. **Email Verification Not Implemented**
   - Accounts created immediately (no confirmation email)
   - Add later in Phase 2

3. **Password Reset Not Implemented**
   - "¿Olvidaste tu contraseña?" link doesn't work yet
   - Create /forgot-password view in Phase 2

4. **Social Login Not Implemented**
   - Plan for Phase 3

5. **Rate Limiting Not Implemented**
   - Implement on backend for security

---

## 📝 Test Report Template

```
Test Date: ____________
Tester: ________________
Browser: _______________
Device: ________________

Issues Found:
1. [CRITICAL/HIGH/MEDIUM/LOW] - Description
   - Steps to reproduce
   - Expected vs Actual
   - Screenshot attached: YES/NO

Pass/Fail: PASS / FAIL

Signature: ___________
```

---

## 🎉 Success Criteria

✅ All tests pass
✅ No console errors
✅ No accessibility issues
✅ Form validation works
✅ Styling matches design
✅ Responsive on all devices
✅ Animations smooth
✅ Ready for backend integration

**Status: READY FOR UAT** 🚀
