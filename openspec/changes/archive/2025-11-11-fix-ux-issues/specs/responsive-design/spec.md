# Capability: Responsive Design

## Overview

Desktop and mobile responsive design for optimal viewing experience across all devices.

## MODIFIED Requirements

### Requirement: Desktop Layout Constraints

The application SHALL constrain video cards to a maximum width on desktop devices while maintaining full-screen on mobile.

#### Scenario: Desktop displays centered cards

**Given** a user accesses the application on a desktop browser with viewport width > 1024px  
**When** a movie card is rendered  
**Then** the card SHALL have a maximum width of 448px (max-w-md)  
**And** the card SHALL be centered horizontally with auto margins

#### Scenario: Mobile displays full-width cards

**Given** a user accesses the application on a mobile device with viewport width < 1024px  
**When** a movie card is rendered  
**Then** the card SHALL span the full width of the viewport  
**And** NO horizontal margins SHALL be applied

### Requirement: Safe Area Support

The application SHALL respect device safe areas (notches, camera cutouts, home indicators).

#### Scenario: iPhone displays content within safe areas

**Given** a user accesses the application on an iPhone with notch  
**When** the page is rendered  
**Then** top content SHALL have padding equal to safe-area-inset-top  
**And** bottom content SHALL have padding equal to safe-area-inset-bottom  
**And** the viewport meta tag SHALL include "viewport-fit=cover"
