## ADDED Requirements

### Requirement: Horizontal Swipe Gesture Detection

The system SHALL detect horizontal swipe gestures on movie cards (left and right).

#### Scenario: Swipe right detected

- **WHEN** user swipes right on a movie card
- **THEN** the system detects the gesture as "interested"
- **AND** advances to the next card
- **AND** adds the movie to favorites

#### Scenario: Swipe left detected

- **WHEN** user swipes left on a movie card
- **THEN** the system detects the gesture as "not interested"
- **AND** advances to the next card
- **AND** does not save the movie

#### Scenario: Swipe threshold

- **WHEN** user drags a card but releases before threshold
- **THEN** the card animates back to center position
- **AND** no action is taken

### Requirement: Card Stack Display

The system SHALL display movie cards in a stack with the active card prominently centered.

#### Scenario: Active card focus

- **WHEN** displaying the movie card stack
- **THEN** the current active card is centered and at full size
- **AND** adjacent cards are partially visible with reduced scale/opacity

#### Scenario: Card transition animation

- **WHEN** user swipes to the next card
- **THEN** the current card animates off-screen in swipe direction
- **AND** the next card scales up and centers with smooth animation

### Requirement: Visual Swipe Feedback

The system SHALL provide visual feedback during swipe gestures.

#### Scenario: Drag indicator

- **WHEN** user drags a card left or right
- **THEN** the card follows the finger/cursor position
- **AND** displays a visual hint (heart icon for right, X icon for left)

#### Scenario: Swipe feedback animation

- **WHEN** swipe is completed
- **THEN** the system briefly displays confirmation (heart or X)
- **AND** shows a toast message ("❤️ Добавлено в избранное" or "❌ Пропущено")

### Requirement: Mobile-First Touch Optimization

The system SHALL optimize touch interactions for mobile devices.

#### Scenario: Smooth touch tracking

- **WHEN** user touches and drags a card on mobile
- **THEN** the card follows the touch position without lag
- **AND** maintains 60fps performance during drag

#### Scenario: Touch gesture cancellation

- **WHEN** user touches a card but doesn't swipe
- **THEN** the system does not trigger a swipe action
- **AND** allows tapping on interactive elements (heart icon, mute button)

### Requirement: Card Navigation State

The system SHALL maintain the current position in the card stack.

#### Scenario: Track current index

- **WHEN** user swipes through cards
- **THEN** the system tracks the current card index
- **AND** prevents navigating beyond available cards

#### Scenario: Load more cards

- **WHEN** user reaches near the end of loaded cards
- **THEN** the system loads more movies from the API
- **AND** seamlessly extends the swipe experience

### Requirement: Blurred Background Effect

The system SHALL display a blurred version of the active movie poster as background.

#### Scenario: Dynamic background

- **WHEN** a movie card becomes active
- **THEN** the system displays the movie's poster as blurred background
- **AND** transitions smoothly when cards change

#### Scenario: Background contrast

- **WHEN** displaying the blurred background
- **THEN** the system applies darkening overlay for better content contrast
- **AND** ensures text and controls remain readable

### Requirement: Responsive Layout

The system SHALL adapt the card interface for different screen sizes.

#### Scenario: Mobile layout

- **WHEN** displaying on mobile devices (< 768px)
- **THEN** cards occupy most of the screen width
- **AND** swipe gestures are optimized for thumb reach

#### Scenario: Tablet/desktop layout

- **WHEN** displaying on larger screens (>= 768px)
- **THEN** cards maintain a maximum width for optimal viewing
- **AND** center horizontally with appropriate margins
