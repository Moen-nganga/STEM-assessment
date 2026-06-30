# Design explanation — Traffic Light Explorer

## Learning objective
By the end of the lesson, a learner should be able to state what each traffic light
colour means (red = stop, yellow = wait, green = go) and pick the correct light
for a given road safety scenario.


## Child-friendly UI
- Large (44px+) tap targets on every button, so the UI works well for small fingers on a phone screen.
- Big, rounded shapes and a simple three-colour palette (sky blue, cream,
  asphalt grey) plus the three real traffic-light colours, used only where they
  mean something — never as decoration.
- Plain, short sentences throughout. Perfect for small kids (7-10) years old
- A friendly animated traffic light "smiling character" that's appealing to kids.

## Accessibility (beyond screen readers)
- **Never colour-only.** Every light state shows a text word (STOP / WAIT / GO) next to the colour.
- High colour contrast between text and backgrounds throughout.
- Visible keyboard focus outlines on every interactive element.

## Performance on low-end Android / low bandwidth
- No external image assets are included, so the traffic light is drawn in inline SVG, so  there's nothing to download beyond the code itself.
- No icon or animation libraries; only plain CSS, so the JS bundle stays small.
- No web-font loading cause the text uses widely pre-installed system fonts

## Suggested features included
- **Animated traffic light** — cycles red → green → yellow on the "learn" screen.
- **Interactive buttons** — the activity stage asks learners to pick the correct light for a scenario.
- **Fun facts** — Added some fun facts to make the lesson more interesting.
- **Progress tracking** — there's a progress bar plus a dot trail that shows the lesson position in real time.
- **Quiz** — there's multiple-choice questions that the kids can answer.
- **Success feedback** — there's a badge and a score summary on completion, with a "play again" option.
 