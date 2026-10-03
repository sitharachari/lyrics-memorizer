# Lyric Memorizer

An interactive typing and memorization web application built with React and TypeScript.

## Why I Built This

I created this app because I get random bursts of having to memorize a certain song completely. Usually, I just write the lyrics out over and over until they're in my head—but since I also love practicing my typing, I thought to mix the two and make an app catered towards memorizing lyrics this way. 

Since I occasionally also want to memorize anything else, there is a feature to paste in any passage you want and memorize that too.

## Features

- **Song Search (LRCLIB Integration):** Search and pull plain lyrics directly from the LRCLIB API.
- **Custom Passage Entry:** Paste any custom lyrics, poem, speech, or passage with custom titles and artist/author tags.
- **Verse Selection:** Choose to practice the entire text at once or isolate specific verses/paragraphs.
- **Practice Mode (Guided):** Real-time typing test with a live caret, WPM and accuracy tracking, and customizable modifiers (*Force Lowercase*, *No Punctuation*, and *First-Letter Mode* to mask word bodies while leaving first-letter cues).
- **Test Mode (Blind):** Type lines completely from memory with optional hints and Levenshtein distance grading that distinguishes between minor typos and actual memory errors.
- **Weak Verse Tracking:** Automatically saves songs and tracks verses where you struggled in `localStorage` so you can jump right back into drilling them later.
- **Custom Color Themes:** Choose from 6 built-in color palettes (*Pine & Sand*, *Aqua Turquoise*, *Cherry Frost*, *Caramel Sunset*, *Indigo Velvet*, and *Night Bordeaux*).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install