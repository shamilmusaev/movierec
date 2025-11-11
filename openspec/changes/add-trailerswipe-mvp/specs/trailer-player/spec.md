## ADDED Requirements

### Requirement: Auto-play Active Trailer

The system SHALL automatically play the trailer video when a movie card becomes active.

#### Scenario: First trailer auto-plays

- **WHEN** the application loads with the first movie card
- **THEN** the trailer starts playing automatically
- **AND** the video is muted by default

#### Scenario: Next trailer plays on swipe

- **WHEN** user swipes to the next movie card
- **THEN** the previous trailer stops playing
- **AND** the new trailer starts playing automatically

### Requirement: Video Player State Management

The system SHALL manage video player lifecycle states (loading, playing, paused, error).

#### Scenario: Handle loading state

- **WHEN** a trailer is being loaded
- **THEN** the system displays a loading indicator
- **AND** prevents user interaction until ready

#### Scenario: Handle playback errors

- **WHEN** a trailer fails to load or play
- **THEN** the system displays the movie poster as fallback
- **AND** logs the error for debugging

### Requirement: Mute Control

The system SHALL provide a mute/unmute toggle for trailer audio.

#### Scenario: User unmutes video

- **WHEN** user taps the mute control icon
- **THEN** the trailer audio is enabled
- **AND** the mute state persists for subsequent trailers

#### Scenario: Default mute state

- **WHEN** trailers auto-play
- **THEN** audio is muted by default
- **AND** meets mobile browser auto-play policies

### Requirement: YouTube Embed Integration

The system SHALL use YouTube embed player for trailer playback.

#### Scenario: Embed YouTube trailer

- **WHEN** displaying a trailer with YouTube key
- **THEN** the system embeds the video using YouTube iframe API
- **AND** includes required parameters (autoplay=1, mute=1)

#### Scenario: Mobile inline playback

- **WHEN** playing trailers on mobile devices
- **THEN** the system enables inline playback attributes
- **AND** prevents fullscreen auto-trigger on iOS

### Requirement: Video Preloading

The system SHALL preload the next trailer to minimize wait time.

#### Scenario: Preload next video

- **WHEN** user is watching the current trailer
- **THEN** the system preloads the next trailer in background
- **AND** ensures smooth transition on swipe

### Requirement: Fallback for Missing Trailers

The system SHALL display movie poster when trailer is unavailable.

#### Scenario: No trailer available

- **WHEN** a movie has no trailer video
- **THEN** the system displays the movie poster
- **AND** shows metadata (title, overview) without video player

#### Scenario: Trailer load failure

- **WHEN** a trailer fails to load after timeout
- **THEN** the system falls back to displaying the poster
- **AND** allows user to continue swiping
