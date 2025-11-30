# Employee Attendance System - Design Guidelines

## Design Approach
**Hybrid Modern Dashboard System** - Drawing inspiration from Linear's clean aesthetics, Notion's data organization, and modern HR tools like BambooHR, combined with enhanced visual effects for engagement.

## Typography System
- **Primary Font**: Inter (Google Fonts) - for UI elements, tables, data
- **Display Font**: Poppins (Google Fonts) - for headings, dashboard titles, stats
- **Hierarchy**:
  - Page Headers: text-4xl font-bold (Poppins)
  - Section Titles: text-2xl font-semibold (Poppins)
  - Card Headers: text-lg font-semibold (Inter)
  - Body/Data: text-base font-normal (Inter)
  - Stats Numbers: text-5xl font-bold (Poppins)
  - Small Labels: text-sm font-medium (Inter)

## Layout & Spacing System
**Standardized Spacing**: Use Tailwind units of 3, 4, 6, 8, and 12 for consistency
- Component padding: p-6 or p-8
- Section margins: mb-8 or mb-12
- Card gaps: gap-6
- Button padding: px-6 py-3
- Dashboard grid gaps: gap-8

**Grid Structure**:
- Dashboard stats: 4-column grid (lg:grid-cols-4 md:grid-cols-2)
- Manager overview cards: 3-column grid (lg:grid-cols-3)
- Attendance tables: Full-width with responsive scroll
- Calendar: 7-column grid for days

## Component Library

### Navigation
- **Sidebar Navigation** (Employee & Manager):
  - Fixed left sidebar (w-64) with logo at top
  - Navigation items with icons (Heroicons) and labels
  - Active state with subtle indicator bar
  - User profile card at bottom with role badge
  - Collapse functionality for mobile

### Dashboard Cards
- **Stat Cards** (Present/Absent/Late counts):
  - Rounded corners (rounded-xl)
  - Elevation with shadow-lg
  - Large number display at top
  - Icon in top-right corner
  - Label below number
  - Animated count-up on load
  - Subtle gradient background fade

- **Chart Cards** (Weekly trends, Department-wise):
  - Use Chart.js for line and bar charts
  - Contained in elevated cards with headers
  - Smooth chart animations on render
  - Responsive sizing

### Calendar Components
- **Monthly Calendar View**:
  - 7-column grid with day headers
  - Each date as rounded square cell
  - Color-coded status:
    - Present: Green fill with white text
    - Absent: Red fill with white text
    - Late: Yellow fill with dark text
    - Half-Day: Orange fill with white text
  - Hover effect: slight scale and shadow
  - Click interaction: modal/slide-in with details
  - Month navigation arrows with smooth transition

### Tables
- **Attendance History Table**:
  - Striped rows for readability
  - Sortable column headers with icons
  - Fixed header on scroll
  - Filter dropdowns inline
  - Status badges with color coding
  - Hover row highlight
  - Export button in table header

### Buttons & CTAs
- **Primary Actions** (Check In/Out):
  - Large rounded button (rounded-lg)
  - Icon + text combination
  - Pulse animation when active/available
  - Disabled state when checked in/out
  
- **Secondary Actions**:
  - Outlined style with hover fill
  - Icon-only variants for compact areas

### Forms
- **Login/Register**:
  - Centered card layout with max-w-md
  - Floating labels on inputs
  - Clear validation states
  - Smooth transition between login/register
  - Role selection with radio cards (visual selection)

- **Filter Forms**:
  - Inline horizontal layout
  - Date range pickers with calendar dropdown
  - Employee multi-select dropdown
  - Apply/Reset buttons grouped

### Modals & Overlays
- **Detail Views**:
  - Slide-in panel from right for date details
  - Backdrop blur effect
  - Close with X or backdrop click
  - Smooth slide animation

## Animation Strategy
**Purposeful Motion** - Animations enhance understanding, not distraction:

- **Page Transitions**: Fade-in on route change (300ms)
- **Dashboard Load**: Stagger stat card appearance (100ms delay each)
- **Chart Rendering**: Smooth draw animation (800ms)
- **Check-In Success**: Confetti or success ripple effect (brief, celebratory)
- **Calendar Navigation**: Slide transition between months (250ms)
- **Hover States**: Scale 1.02 and shadow increase (150ms)
- **Loading States**: Skeleton screens with shimmer effect
- **Number Count-Up**: Animated counting for stat numbers (1000ms)

## Images

### Hero/Welcome Sections
- **Dashboard Welcome Banner**: 
  - Full-width subtle gradient background with abstract office/team illustration overlay (low opacity)
  - No actual hero image needed - focus on data visibility

### Empty States
- **No Attendance Records**: Friendly illustration of calendar/clock
- **All Team Present**: Celebration illustration
- **No Results Found**: Magnifying glass illustration

### Profile Avatars
- Use avatar placeholder service or initials in colored circles
- Consistent circular shape (h-10 w-10 for nav, larger for profile)

## Special Features

### Status Indicators
- **Today's Status Badge**:
  - Checked In: Pulsing green dot with "Active" text
  - Not Checked In: Gray outline with "Check In" prompt
  - Late: Yellow badge with time difference

### Export Functionality
- Download button with icon (download arrow)
- Progress indicator during export
- Success toast notification

### Responsive Breakpoints
- Mobile (< 768px): Stack all grids to single column, hamburger nav
- Tablet (768px - 1024px): 2-column grids, visible sidebar
- Desktop (> 1024px): Full multi-column layouts

### Accessibility
- All interactive elements minimum 44px touch target
- Keyboard navigation for calendar and tables
- ARIA labels on icon-only buttons
- High contrast for status indicators
- Focus visible states with ring-2

## Layout Patterns

**Employee Dashboard**: Stats row (4 cols) → Quick action card → Recent attendance table → Monthly calendar

**Manager Dashboard**: Team stats row (4 cols) → Charts row (2 cols) → Today's absent list → Weekly attendance table

**Attendance History**: Filters bar → Calendar view (primary) → Table view toggle

**Reports Page**: Date/employee selectors → Preview table → Export button (sticky)

This design balances professional functionality with engaging visual effects, creating an attendance system that's both efficient and enjoyable to use daily.