## MODIFIED Requirements

### Requirement: Video Container Aspect Ratio

The system SHALL display trailer videos in vertical portrait format optimized for mobile viewing.

#### Scenario: Vertical video display

- **WHEN** a trailer video is displayed
- **THEN** the video container uses portrait aspect ratio (9:16 or similar)
- **AND** the video fills 85% of viewport height
- **AND** horizontal video content is cropped to fit using object-fit cover

#### Scenario: Edge-to-edge display

- **WHEN** displaying video on mobile devices
- **THEN** the video extends edge-to-edge horizontally
- **AND** uses full available width without max-width constraints

### Requirement: Video Content Cropping

The system SHALL intelligently crop horizontal trailers to fit vertical format.

#### Scenario: Horizontal trailer cropping

- **WHEN** a horizontal (16:9) trailer is displayed in vertical format
- **THEN** the video is cropped using center-focused object-fit cover
- **AND** maintains video quality without stretching
- **AND** critical content remains visible

#### Scenario: Video positioning

- **WHEN** cropping video content
- **THEN** the video is centered both horizontally and vertically
- **AND** uses object-position center for optimal framing

### Requirement: Mute Control Visibility

The system SHALL ensure mute button remains visible over vertical video content.

#### Scenario: Mute button positioning

- **WHEN** displaying mute control on vertical video
- **THEN** the button is positioned in bottom-right corner
- **AND** appears above the info gradient overlay
- **AND** has sufficient background contrast for visibility
