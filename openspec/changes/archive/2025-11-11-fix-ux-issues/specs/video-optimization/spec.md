# Capability: Video Optimization

## Overview

YouTube video playback optimization including loop, quality, and state management.

## MODIFIED Requirements

### Requirement: Video Looping

YouTube trailers SHALL loop infinitely without showing related videos.

#### Scenario: Video loops seamlessly

**Given** a movie card with a YouTube trailer is displayed  
**When** the trailer finishes playing  
**Then** the video SHALL restart from the beginning  
**And** NO related videos grid SHALL be shown  
**And** the URL SHALL include "loop=1" and "playlist={videoKey}" parameters

### Requirement: Video Quality

YouTube videos SHALL play in HD quality when available.

#### Scenario: Video loads in HD

**Given** a YouTube trailer is being loaded  
**When** the embed URL is constructed  
**Then** the URL SHALL include "vq=hd720" parameter  
**And** the video SHALL attempt to play in 720p resolution

### Requirement: Mute State Persistence

The mute/unmute state SHALL persist across video changes.

#### Scenario: Mute state maintained on swipe

**Given** a user unmutes a video  
**When** the user swipes to the next video  
**Then** the new video SHALL also be unmuted  
**And** the mute button icon SHALL reflect the correct state  
**And** the postMessage API SHALL apply the mute state after 500ms delay
