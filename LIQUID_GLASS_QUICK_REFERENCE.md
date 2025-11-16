# 🎨 Liquid Glass Design System - Quick Reference

## 📚 Class Usage Guide

### Navigation Components
```tsx
// Top & Bottom Navigation
<nav className="floating-nav-bar">
  {/* Items automatically styled */}
</nav>
```

### Content Cards
```tsx
// Large cards (Posts, Articles, Featured)
<div className="floating-island-lg floating-island-hover">
  Post content here
</div>

// Medium cards (Profile sections)
<div className="floating-island floating-island-hover">
  Profile info here
</div>

// Small cards (Chips, badges)
<div className="floating-island-sm">
  Small content
</div>
```

### Glass Effects
```tsx
// Strong glass (Prominent elements)
<div className="liquid-glass-strong">
  Featured content
</div>

// Standard glass (General containers)
<div className="liquid-glass">
  Regular content
</div>

// Subtle glass (Inputs)
<div className="liquid-glass-subtle">
  Input fields
</div>

// Hybrid glass + island
<div className="glass-island">
  Special highlight
</div>
```

### Forms & Inputs
```tsx
// Text inputs
<input type="text" className="glass-input px-4 py-2" />

// Buttons
<button className="glass-btn">Click me</button>
```

### Modals & Overlays
```tsx
<div className="floating-modal">
  Modal content here
</div>
```

### Container Pattern
```tsx
<div className="floating-container">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## 🎯 Class Directory

| Class | Purpose | Size | Use Case |
|-------|---------|------|----------|
| `floating-nav-bar` | Navigation styling | Medium | Top/bottom nav |
| `floating-island-lg` | Large cards | Large | Posts, main content |
| `floating-island` | Standard cards | Medium | Profiles, sections |
| `floating-island-sm` | Small elements | Small | Buttons, chips |
| `floating-island-hover` | Hover lift effect | Any | Interactive elements |
| `floating-island-active` | Press feedback | Any | Active states |
| `floating-modal` | Modal styling | Large | Dialogs, overlays |
| `liquid-glass` | Standard glass | Medium | General containers |
| `liquid-glass-strong` | Enhanced glass | Medium | Prominent elements |
| `liquid-glass-subtle` | Subtle glass | Small | Input fields |
| `glass-island` | Hybrid effect | Medium | Special highlights |
| `glass-input` | Input styling | Small | Form fields |
| `glass-btn` | Button styling | Small | Buttons |
| `floating-container` | Layout pattern | Large | Multi-item layouts |

---

## 🎨 Dark Mode

All classes automatically support dark mode:
```tsx
// Light mode (default)
<div className="floating-island">Content</div>

// Dark mode (automatic in dark.class)
// Applies to element when .dark class on parent
```

---

## ✨ Animations

### Hover Effects
- **floating-island-hover**: Lifts element up 4px with enhanced shadow
- **glass-btn**: Lifts 2px with shadow glow
- **Duration**: 300ms with spring easing

### Active States
- **floating-island-active**: Presses down 2px
- Provides tactile feedback on click

---

## 📱 Responsive

All classes are fully responsive:
- Mobile optimizations for shadows
- Touch-friendly sizing
- Reduced motion support
- No breakpoint-specific variants needed

---

## 🚀 Performance

- ✅ GPU-accelerated (uses transform)
- ✅ No JavaScript required
- ✅ ~12KB minified CSS
- ✅ Will-change optimization
- ✅ Mobile-optimized

---

## 🎯 Quick Examples

### Feed Layout
```tsx
<div className="floating-container">
  {posts.map(post => (
    <div key={post.id} className="floating-island-lg floating-island-hover">
      {/* Post content */}
    </div>
  ))}
</div>
```

### Search Bar
```tsx
<button className="glass-btn">
  <SearchIcon />
</button>
<input type="text" className="glass-input px-4 py-2" />
```

### Modal Overlay
```tsx
<div className="floating-modal">
  <h2>Settings</h2>
  {/* Settings content */}
</div>
```

### Profile Section
```tsx
<div className="floating-island">
  <img src={avatar} alt="User" />
  <h1>{name}</h1>
  <p>{bio}</p>
</div>
```

---

## 🔧 Customization

To customize classes, edit `app/globals.css` and modify:
- Blur amount: `blur(10px)` → `blur(15px)`
- Colors: `rgba(255, 255, 255, 0.1)` → adjust alpha
- Shadows: `0 8px 32px` → adjust values
- Radius: `16px` → adjust as needed
- Padding: `16px 24px` → adjust spacing

---

## 📋 Components Using This System

1. ✅ TopNav - `floating-nav-bar`
2. ✅ BottomNav - `floating-nav-bar`
3. ✅ PostCard - `floating-island-lg floating-island-hover`
4. ✅ VideoCard - `floating-island-lg floating-island-hover`
5. ✅ UserProfile - `floating-island`
6. ✅ SearchBar - `glass-btn` + `floating-modal`
7. ✅ PostSearchModal - `floating-modal`

---

## 🎓 Design Principles

1. **Hierarchy**: Use size variants to show importance
2. **Interaction**: Add hover/active effects to interactive elements
3. **Consistency**: Use same class for similar elements
4. **Performance**: Never duplicate class styles inline
5. **Accessibility**: Respect reduced-motion preferences

---

## 🐛 Troubleshooting

**Element not styled?**
- Check parent has `dark` class for dark mode
- Verify class name spelling
- Ensure Tailwind CSS is loaded

**Animation not smooth?**
- Check browser supports backdrop-filter
- Verify GPU acceleration on element
- Check for conflicting CSS rules

**Dark mode not working?**
- Ensure `.dark` class on document root or parent
- Check CSS specificity isn't being overridden
- Use browser DevTools to verify dark mode rules

