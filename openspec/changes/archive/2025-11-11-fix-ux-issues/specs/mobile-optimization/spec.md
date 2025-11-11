# Capability: Mobile Optimization

## Overview

Mobile-specific UI optimizations for readability and usability.

## MODIFIED Requirements

### Requirement: Text Readability

Text overlays SHALL be readable without heavy gradients using drop-shadows.

#### Scenario: Text is readable over video

**Given** a movie card is displayed with video playing  
**When** movie title and description are rendered  
**Then** title SHALL be text-4xl size with drop-shadow-lg  
**And** description SHALL be text-base size with drop-shadow-md  
**And** rating text SHALL be text-base with drop-shadow-md  
**And** all text SHALL be white color for maximum contrast

### Requirement: Gradient Overlay

Video overlay gradient SHALL be minimal and only at the bottom.

#### Scenario: Video is bright and clear

**Given** a movie card with video is displayed  
**When** the gradient overlay is rendered  
**Then** the gradient SHALL only cover the bottom 48 units (h-48)  
**And** the gradient SHALL be from-black/80 via-black/20 to-transparent  
**And** NO gradient SHALL cover the video content area

### Requirement: Button Positioning

Control buttons SHALL not interfere with content.

#### Scenario: Mute button is accessible

**Given** a video is playing  
**When** the mute button is rendered  
**Then** the button SHALL be positioned at top-left  
**And** the button SHALL have safe-area padding (mt-safe)  
**And** the button SHALL have backdrop-blur-sm for visibility  
**And** the button SHALL NOT overlap movie info text
