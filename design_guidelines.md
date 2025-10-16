# Design Guidelines: The Hub - Academic Collaboration Platform

## Design Approach

**Selected Approach:** Hybrid Reference-Based (Notion + Linear + Discord)
**Justification:** Students need a familiar, productivity-focused interface that balances professional academic organization with social collaboration features.

**References:**
- **Primary:** Notion (organizational structure, content hierarchy, clean data presentation)
- **Secondary:** Linear (modern aesthetics, subtle interactions, typography)
- **Tertiary:** Discord (community features, chat interface, study circle structure)

**Core Principles:**
1. Academic clarity over visual flair
2. Information hierarchy that guides learning
3. Collaborative features feel approachable, not corporate
4. Performance and speed for student workflows

---

## Color Palette

### Light Mode
- **Primary:** 220 90% 56% (Trust blue - academic, professional)
- **Primary Hover:** 220 90% 48%
- **Secondary:** 220 20% 96% (Subtle backgrounds)
- **Accent:** 142 71% 45% (Success green for achievements, approvals)
- **Surface:** 0 0% 100% (White cards and containers)
- **Background:** 220 15% 98% (Off-white page background)
- **Text Primary:** 220 15% 20%
- **Text Secondary:** 220 10% 46%
- **Border:** 220 13% 91%

### Dark Mode
- **Primary:** 220 90% 60%
- **Primary Hover:** 220 90% 68%
- **Secondary:** 220 20% 18%
- **Accent:** 142 71% 55%
- **Surface:** 220 15% 12% (Cards and containers)
- **Background:** 220 20% 8% (Page background)
- **Text Primary:** 220 15% 95%
- **Text Secondary:** 220 10% 65%
- **Border:** 220 15% 20%

**Rating/Difficulty Colors:**
- Easy: 142 71% 45%
- Medium: 43 96% 56%
- Hard: 0 84% 60%

---

## Typography

**Font Families:**
- **Primary:** Inter (Google Fonts) - body text, UI elements, clean readability
- **Headings:** Inter (heavier weights 600-700) - maintain consistency
- **Monospace:** JetBrains Mono (for code snippets in CS courses)

**Scale:**
- **Hero/Page Titles:** text-4xl md:text-5xl font-bold (36-48px)
- **Section Headers:** text-2xl md:text-3xl font-semibold (24-30px)
- **Card Titles:** text-lg font-semibold (18px)
- **Body Text:** text-base (16px)
- **Secondary Text:** text-sm (14px)
- **Metadata/Captions:** text-xs (12px)

**Line Heights:** Use generous spacing for readability - leading-relaxed (1.625) for body text

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 for consistency
- **Tight spacing:** p-2, gap-2 (icon groups, compact lists)
- **Standard spacing:** p-4, gap-4 (card padding, form fields)
- **Section spacing:** py-8 md:py-12 (between major sections)
- **Generous spacing:** py-16 md:py-20 (landing page sections)

**Grid System:**
- **Main Layout:** Max width of 7xl (1280px) with responsive padding (px-4 md:px-8)
- **Dashboard:** Sidebar (w-64) + Main content with overflow handling
- **Study Circles Grid:** grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Course Cards:** grid-cols-1 lg:grid-cols-2 gap-6

---

## Component Library

### Navigation
- **Top Bar:** Sticky header with logo, search, and user menu. Height h-16, shadow-sm border-b
- **Sidebar:** Fixed left navigation (hidden on mobile, slide-out menu). Categories: Dashboard, My Circles, Browse Courses, Messages
- **Breadcrumbs:** Show hierarchy: College → Course → Study Circle

### Cards & Containers
- **Study Circle Cards:** Rounded-lg with shadow-sm, hover:shadow-md transition. Include course code, member count, activity indicator
- **Course Cards:** Larger cards with difficulty badge, rating stars, enrollment count, "Join Circle" CTA
- **Discussion Threads:** Nested with indentation (ml-8), profile avatar, timestamp, upvote count

### Data Display
- **Rating System:** 5-star display (filled/outlined stars), aggregate score, distribution bars
- **Difficulty Badge:** Pill-shaped (rounded-full px-3 py-1) with color-coded background
- **Member Avatars:** Circular overlapping stack (–ml-2) showing first 3-4 members + count
- **Activity Feed:** Timeline layout with left-aligned timestamps, grouped by date

### Forms & Inputs
- **Search Bar:** Prominent in header, rounded-full with icon, min-w-[300px] on desktop
- **Text Inputs:** rounded-lg border-2 focus:border-primary transition, consistent h-10 for single-line
- **Textareas:** For discussion posts, min-h-[120px], resize-y
- **File Upload:** Drag-and-drop zone with dashed border, hover state, file type icons

### Messaging/Chat
- **Chat Interface:** Discord-inspired with message bubbles, timestamps, threaded replies
- **Message Input:** Fixed bottom bar with textarea, emoji picker, file attach button
- **Typing Indicators:** Subtle animated dots when others are typing

### Modals & Overlays
- **Study Circle Creation:** Multi-step modal (course selection → details → privacy settings)
- **Course Rating Modal:** Star rating + sliders for difficulty/workload/quality + textarea for comments
- **Confirmation Dialogs:** Simple center-screen overlay with clear primary/secondary actions

---

## Images

**Hero Section:** YES - Use an authentic, diverse group of students collaborating in a modern study space. Image should feel warm, inclusive, and academic. Position: Full-width hero section with text overlay (left-aligned), image slightly darkened with overlay for text contrast.

**Additional Images:**
- **Feature Sections:** Use illustrated icons (not photos) for AI features, study tools, collaboration
- **Empty States:** Friendly illustrations when no study circles joined yet or no courses added
- **Profile Avatars:** User-uploaded or generated avatars with fallback to initials on colored background
- **Course Thumbnails:** Small icons or department-specific imagery

---

## Special Considerations

**AI Features Visibility:**
- AI-powered features (summarization, recommendations) use subtle purple accent (270 60% 65%) to differentiate from standard features
- "✨ AI Summary" badges on auto-generated content
- Loading states for AI processing with animated gradient shimmer

**Cross-Campus Comparison:**
- Side-by-side comparison cards with synchronized scrolling
- Highlight differences in colored backgrounds (subtle yellow 48 100% 96% for notable differences)

**Accessibility:**
- All form inputs maintain dark mode consistency
- Focus states prominent with 2px outline in primary color
- Color never sole indicator (use icons + text)
- ARIA labels for all interactive elements

**Animations:** Minimal - only subtle transitions (200ms) on hover states and smooth page transitions. No distracting scroll effects or excessive motion.