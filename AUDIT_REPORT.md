# Comprehensive Codebase Audit Report
**Date:** November 16, 2025

---

## CRITICAL BUGS (Fix Immediately)

### 1. **TopNav.tsx - Duplicate Variable Assignment**
- **File:** `components/layout/TopNav.tsx` (Line 18)
- **Severity:** CRITICAL
- **Issue:** `const router = usePathname();` - router is assigned the pathname instead of being a Router instance
- **Impact:** Router operations would fail silently
- **Fix:** Remove the duplicate line (line 18), keep only the usePathname assignment on line 17
- **Why:** useRouter() is never imported/called, making this line incorrect

### 2. **profile/page.tsx - Missing Dependency in useEffect**
- **File:** `app/profile/page.tsx` (Line 19)
- **Severity:** HIGH
- **Issue:** `useEffect(() => { fetchUser(); }, [router])` - dependency array only includes router, but router.replace() is called inside
- **Impact:** Effect may run unexpectedly, causing infinite redirects
- **Fix:** Add proper dependency array: `[router]` is sufficient, but should consider empty array if this is one-time setup
- **Why:** ESLint warning about dependency arrays affecting reliability

### 3. **ChatRoom.tsx - Missing Event Listener Cleanup**
- **File:** `components/chat/ChatRoom.tsx` (Line 85-95)
- **Severity:** HIGH
- **Issue:** `subscribeToMessages()` creates a channel but return function isn't assigned to useEffect cleanup
- **Impact:** Memory leak - Supabase subscriptions won't be cleaned up on unmount
- **Fix:** Return the cleanup function from subscription
```tsx
useEffect(() => {
  const unsubscribe = subscribeToMessages();
  return () => unsubscribe?.();
}, [receiverId]);
```
- **Why:** This causes multiple subscriptions on re-renders

### 4. **Console.error() in Production Code**
- **Files:** 
  - `components/feed/PhotoFeed.tsx` (Line 30)
  - `components/profile/UserProfile.tsx` (Line 46)
  - `components/chat/ChatRoom.tsx` (Line 73)
  - `components/layout/SearchBar.tsx` (Line 65)
  - `components/videos/VideoCard.tsx` (Line 53 - catch block)
- **Severity:** MEDIUM
- **Issue:** console.error() left in production code
- **Impact:** Logs internal errors to browser console (okay for debugging, but not ideal for production)
- **Fix:** Remove or wrap in error boundary / proper error handling
- **Why:** Production code shouldn't expose internal errors

### 5. **SearchBar.tsx - Missing currentUserId Dependency**
- **File:** `components/layout/SearchBar.tsx` (Line 48)
- **Severity:** MEDIUM
- **Issue:** useEffect dependency array includes `currentUserId` but `supabase` is used without being in dependencies
- **Impact:** Stale closure - may use outdated supabase instance
- **Fix:** Add supabase to dependency array or restructure

### 6. **create/page.tsx - Improper useSearchParams Usage**
- **File:** `app/create/page.tsx` (Line 6)
- **Severity:** HIGH
- **Issue:** `useSearchParams()` is used in CreatePostContent (client component)
- **Problem:** useSearchParams() requires proper Suspense boundary OR component must be in a client-only subtree
- **Impact:** Potential hydration mismatch or runtime error
- **Fix:** Either add Suspense boundary OR wrap useSearchParams logic separately
- **Why:** Next.js requires Suspense for dynamic reads like useSearchParams in client components

---

## RESPONSIVENESS ISSUES

### 1. **TopNav & BottomNav - Poor Mobile Support**
- **File:** `components/layout/TopNav.tsx`, `components/layout/BottomNav.tsx`
- **Severity:** HIGH
- **Issues:**
  - TopNav max-width is `max-w-xs sm:max-w-md lg:max-w-2xl` - may be too wide on large phones
  - BottomNav width calculation `w-[calc(100%-2rem)]` doesn't scale well on small devices
  - Touch targets on nav buttons are only 36px (should be min 44px)
  - Gap between nav items is `gap-1.5 sm:gap-2 md:gap-3` - too small on mobile
- **Fix:** 
  - Ensure touch targets are at least 44x44px
  - Use responsive gaps: `gap-1 sm:gap-2 md:gap-3`
  - Add padding: `p-2 sm:p-3 md:p-4`

### 2. **PostGrid - 3-Column Grid Too Narrow on Mobile**
- **File:** `components/profile/PostGrid.tsx` (Line 24)
- **Severity:** MEDIUM
- **Issue:** `grid-cols-3` is always 3 columns - shows 3 small thumbnails on mobile (300px width for all 3)
- **Impact:** Images are too small to see details, not mobile-friendly
- **Fix:** 
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 sm:gap-2 md:gap-3">
```
- **Why:** Mobile users need larger touch targets

### 3. **PostModal - Not Responsive on Mobile**
- **File:** `components/profile/PostModal.tsx` (Line 75)
- **Severity:** HIGH
- **Issue:** `grid-cols-1 md:grid-cols-3` works, but:
  - Media section has `min-h-80 md:min-h-full` - 320px height may be too large on 320px width screens
  - Navigation arrows are 40px - good, but may overlap content on small screens
  - Text sizing not responsive
- **Fix:** 
  - Adjust modal padding: `p-2 sm:p-4`
  - Make arrow buttons smaller on mobile: `w-8 h-8 sm:w-10 sm:h-10`
  - Reduce modal max-width on mobile: `max-w-full sm:max-w-2xl md:max-w-5xl`

### 4. **Form Inputs - Not Mobile-Optimized**
- **Files:** `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `app/create/page.tsx`
- **Severity:** MEDIUM
- **Issues:**
  - Input height is fixed `py-3` - should be taller on mobile for easier touch: `py-3 sm:py-4`
  - Focus ring may be hard to see: should have better contrast
  - No proper zoom behavior on iOS
- **Fix:** Increase padding on mobile, ensure font-size is `16px` or larger

### 5. **Image Sizes Not Responsive**
- **Files:** Multiple files using `<img>` without width/height constraints
- **Severity:** MEDIUM
- **Issues:**
  - `components/profile/PostGrid.tsx` line 35 uses `<img>` without responsive sizes
  - `components/profile/PostModal.tsx` line 113 uses `<img>` without responsive classes
  - No `w-full` or `max-w-*` constraints on images
- **Fix:** Add `w-full h-full object-cover` to all images

### 6. **Missing `<img>` alt Text (Accessibility)**
- **Files:** `PostGrid.tsx`, `PostModal.tsx`, `PostCard.tsx`, `VideoCard.tsx`
- **Severity:** MEDIUM
- **Issue:** Several `<img>` tags missing alt text
- **Examples:**
  - `PostGrid.tsx` line 37: `alt="Post"` (too generic)
  - `PostModal.tsx` line 113: `alt="Post"` (should be `alt={post.caption || "Post"}`
- **Fix:** Use meaningful alt text with post caption or user info

---

## DATABASE/SUPABASE ISSUES

### 1. **Missing Error Handling on Database Queries**
- **Files:** Multiple locations
- **Severity:** HIGH
- **Issues:**
  - `PhotoFeed.tsx` - error logged but not shown to user
  - `UserProfile.tsx` - friendship check has no error handling
  - `ChatList.tsx` - no error handling on message subscription
- **Fix:** Add user-facing error messages (toast notifications)

### 2. **Potential N+1 Query on PostGrid**
- **File:** `components/profile/UserProfile.tsx` (Line 38-55)
- **Severity:** MEDIUM
- **Issue:** Loads user, then loads all posts separately - two queries
- **Impact:** Slower load times
- **Optimization:** Consider if this is acceptable for UI patterns

### 3. **Single() Query Without Null Check**
- **File:** Multiple files: `UserProfile.tsx`, `ChatRoom.tsx`, `SearchBar.tsx`
- **Severity:** MEDIUM
- **Issue:** `.single()` throws error if no row found, but some errors are silently caught
- **Fix:** Add proper error handling: `if (userError && userError.code !== 'PGRST116') throw userError`

---

## ACCESSIBILITY ISSUES

### 1. **Missing aria-labels on Icon Buttons**
- **Files:** `TopNav.tsx`, `BottomNav.tsx`, `PostGrid.tsx`, `PostModal.tsx`
- **Severity:** MEDIUM
- **Issue:** Icon-only buttons lack accessibility labels
- **Examples:**
  - Close button in PostModal: should have `aria-label="Close modal"`
  - Navigation arrows: should have `aria-label="Previous post"`
  - Like button: should have `aria-label="Like post"`
- **Fix:** Add `aria-label` attribute to all icon buttons

### 2. **Insufficient Color Contrast**
- **File:** `components/layout/SearchBar.tsx`
- **Severity:** LOW
- **Issue:** Text with `text-black/40 dark:text-white/40` may have low contrast
- **Fix:** Use `text-black/60 dark:text-white/60` or higher

### 3. **Missing Focus States**
- **Files:** All interactive elements
- **Severity:** MEDIUM
- **Issue:** Buttons and links should have visible focus states for keyboard navigation
- **Fix:** Add focus ring: `focus:ring-2 focus:ring-offset-2`

### 4. **Heading Hierarchy**
- **File:** `components/profile/UserProfile.tsx`
- **Severity:** LOW
- **Issue:** Profile uses `<h1>` for stats header - verify proper h1/h2/h3 hierarchy

---

## PERFORMANCE ISSUES

### 1. **Unnecessary Re-renders in Feed**
- **File:** `components/feed/PhotoFeed.tsx`
- **Severity:** MEDIUM
- **Issue:** No memoization on PostCard components
- **Fix:** Wrap PostCard in React.memo

### 2. **Large Image Files**
- **Severity:** HIGH
- **Issue:** App uses `<img>` instead of Next.js `<Image>` component
- **Impact:** Images not optimized - larger bundle sizes
- **Fix:** Import from `next/image` and use responsive Image component
- **Files affected:** `PostGrid.tsx`, `PostModal.tsx`, `PostCard.tsx` and others

### 3. **Unoptimized Bundle Size from Framer Motion**
- **Files:** `TopNav.tsx`, `BottomNav.tsx`, `SearchBar.tsx`
- **Severity:** MEDIUM
- **Issue:** Framer Motion adds ~50KB to bundle
- **Note:** Already removed from feed components in previous session

### 4. **Missing Loading States**
- **File:** `components/chat/ChatRoom.tsx`
- **Severity:** LOW
- **Issue:** Loading state says "Loading chat..." but doesn't update - users unsure if it's working

---

## CODE QUALITY ISSUES

### 1. **Unused Imports**
- **Files:** Some components import unused items
- **Severity:** LOW
- **Issue:** Clean up unused imports

### 2. **Inconsistent Error Handling Pattern**
- **Severity:** MEDIUM
- **Issue:** Some components use try/catch, others use `.error` from Supabase
- **Fix:** Standardize on one pattern

### 3. **Magic Numbers**
- **Files:** `components/layout/SearchBar.tsx` (Line 56 - debounce 300ms), `VideoCard.tsx` (touch distance 50px)
- **Severity:** LOW
- **Fix:** Extract to named constants

---

## SUMMARY BY PRIORITY

### 🔴 CRITICAL (Fix First)
1. TopNav router variable duplication
2. Missing Suspense boundary for useSearchParams in create/page.tsx
3. ChatRoom subscription cleanup missing
4. PostGrid not responsive on mobile (too many columns)
5. PostModal needs mobile optimization

### 🟠 HIGH (Fix Soon)
1. Missing error handling on database queries
2. Profile page dependency array issue
3. Image optimization (use Next.js Image component)
4. Touch targets too small on mobile
5. Console.error in production

### 🟡 MEDIUM (Fix Before Deploy)
1. Missing aria-labels on buttons
2. PostCard memoization for performance
3. Standardize error handling
4. Improve form input sizing on mobile
5. Add focus states

### 🟢 LOW (Nice to Have)
1. alt text improvements
2. Remove magic numbers
3. Clean up unused imports

---

## MOBILE-FIRST CHECKLIST

- [ ] All buttons/touch targets are 44x44px minimum
- [ ] Text is 16px+ on mobile
- [ ] No horizontal scrolling on 320px viewport
- [ ] Forms stack vertically on mobile
- [ ] Images scale properly with `w-full` and aspect ratio
- [ ] Modals take full screen on mobile, centered on desktop
- [ ] Navigation is touch-friendly with proper spacing
- [ ] PostGrid uses 2-3 columns max on mobile
- [ ] All interactive elements have focus states
- [ ] All buttons/icons have aria-labels

---

## NEXT STEPS

1. Implement critical fixes (next section)
2. Run build verification
3. Test on mobile devices (320px, 375px, 414px viewports)
4. Implement remaining HIGH priority items
5. Add comprehensive error handling
6. Deploy with confidence
