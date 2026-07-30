# Design system

## Confirmed direction

The interface should feel official, calm, trustworthy, and contemporary. It must serve older and nontechnical users without looking dated. The core palette is navy, muted teal, warm gold, and off-white.

Confirmed usability rules:

- Responsive website behavior; no mobile-app patterns are assumed.
- Plain language, readable typography, generous spacing, and obvious navigation.
- Large interaction targets and clear keyboard focus.
- Never communicate status using color alone.
- Destructive or publishing actions require clear confirmation and feedback.

## Proposed foundations — requires visual approval

The following values are starting points, not approved brand standards.

| Token | Proposed value | Intended use |
| --- | --- | --- |
| Navy 900 | `#102A43` | Headers, primary actions, institutional anchors |
| Navy 700 | `#243B53` | Secondary text and surfaces |
| Teal 600 | `#3F7775` | Supporting actions and highlights |
| Gold 500 | `#C39A4A` | Restrained emphasis and official accents |
| Off-white | `#F7F4EC` | Main page background |
| White | `#FFFFFF` | Cards and raised surfaces |
| Gray 700 | `#344054` | Body text |
| Red 700 | `#B42318` | Errors and destructive actions |

Verify all foreground/background combinations against WCAG contrast requirements before adoption. Gold should normally be an accent, not body text on a light background.

### Typography

- Use a highly legible sans-serif for interface and body text.
- Use a restrained display or serif face only if approved for official headings.
- Default body text should be at least 16px, with comfortable line height.
- Do not rely on very light weights, all-caps paragraphs, or tightly packed text.

### Layout

- Use a consistent content width and spacing scale.
- Start with a single-column mobile layout, then add columns only when space and task flow justify them.
- Keep primary navigation recognizable; avoid hidden navigation on larger screens.
- Forms should usually use one column, persistent labels, concise help, and field-level errors.

### Components

Prioritize reusable headers, navigation, breadcrumbs, buttons, alerts, cards, form fields, tables, pagination, status badges, dialogs, and empty states. Dashboard tables need a responsive alternative and must not require precise pointer use.

## Accessibility acceptance criteria

- Full keyboard operation with a visible focus indicator.
- Semantic landmarks and a logical heading structure.
- Text alternatives for meaningful images.
- Labels and helpful errors for every form control.
- Touch targets sized for comfortable use.
- Zoom and reflow without loss of content or function.
- Reduced-motion preferences respected.
- Automated checks supplemented by keyboard and screen-reader review.
