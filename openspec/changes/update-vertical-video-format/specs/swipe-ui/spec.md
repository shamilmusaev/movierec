## MODIFIED Requirements

### Requirement: Vertical Card Dimensions

The system SHALL display movie cards in full-height vertical format for immersive mobile experience.

#### Scenario: Card height and width

- **WHEN** displaying a movie card
- **THEN** the card height is 85% of viewport height (85vh)
- **AND** the card width extends full width on mobile (no max-width)
- **AND** maintains responsive behavior on different screen sizes

#### Scenario: Edge-to-edge layout

- **WHEN** displaying cards on mobile devices
- **THEN** cards use full available horizontal space
- **AND** remove horizontal padding for immersive experience
- **AND** maintain small border-radius only if desired for design

### Requirement: Movie Info Overlay Position

The system SHALL position movie information at bottom of vertical card with gradient overlay.

#### Scenario: Info overlay layout

- **WHEN** displaying movie information on card
- **THEN** title, description, and metadata are positioned at absolute bottom
- **AND** gradient overlay extends higher (200-300px) for readability
- **AND** text content doesn't overflow allocated space

#### Scenario: Text sizing for vertical space

- **WHEN** displaying movie info in vertical format
- **THEN** title text can be larger (2xl or 3xl) due to more height
- **AND** description uses line-clamp-2 or line-clamp-3
- **AND** all text remains readable against video/poster background

### Requirement: Poster Fallback in Vertical Format

The system SHALL display poster images optimally in vertical format when trailers unavailable.

#### Scenario: Vertical poster display

- **WHEN** displaying poster as fallback in vertical format
- **THEN** poster uses object-fit cover to fill vertical space
- **AND** poster is centered using object-position center
- **AND** poster maintains quality without stretching

#### Scenario: Various poster aspect ratios

- **WHEN** posters have different aspect ratios
- **THEN** the system crops appropriately to fit vertical format
- **AND** ensures key poster content remains visible

### Requirement: Swipe Gesture Adaptation

The system SHALL adapt swipe gestures to work smoothly with taller vertical cards.

#### Scenario: Vertical card swiping

- **WHEN** user swipes taller vertical cards
- **THEN** swipe threshold and velocity calculations remain responsive
- **AND** card animations maintain smooth 60fps performance
- **AND** swipe indicators position appropriately for vertical layout

#### Scenario: Swipe feedback visibility

- **WHEN** user drags a vertical card
- **THEN** heart and X indicators are visible mid-card
- **AND** indicators don't overlap with critical video content
- **AND** feedback animations work smoothly with taller cards

### Requirement: Blurred Background for Vertical Format

The system SHALL adjust blurred background to complement vertical card layout.

#### Scenario: Background composition

- **WHEN** displaying vertical cards with blurred background
- **THEN** background uses backdrop or poster image
- **AND** blur intensity is optimized for vertical format
- **AND** background doesn't distract from main vertical content

### Requirement: Safe Area Handling

The system SHALL respect device safe areas (notches, bottom bars) in vertical format.

#### Scenario: Top safe area

- **WHEN** displaying on devices with notches
- **THEN** top content respects safe-area-inset-top
- **AND** category tabs and favorite icon don't overlap notch

#### Scenario: Bottom safe area

- **WHEN** displaying on devices with home indicators
- **THEN** movie info and controls respect safe-area-inset-bottom
- **AND** bottom tab bar accounts for safe area
