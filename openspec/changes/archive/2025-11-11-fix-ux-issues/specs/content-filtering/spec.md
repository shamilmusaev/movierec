# Capability: Content Filtering

## Overview

Filter and validate movie trailers to ensure only content with available videos is shown.

## ADDED Requirements

### Requirement: Trailer Availability Filtering

The application SHALL only display movies that have valid YouTube trailers.

#### Scenario: Movies without trailers are filtered out

**Given** the application fetches a list of movies from TMDB  
**When** trailer data is loaded for each movie  
**Then** movies with null or empty trailer keys SHALL be filtered out  
**And** only movies with valid trailer.key values SHALL be added to the feed  
**And** the console SHALL log the count of valid trailers

#### Scenario: Sufficient content is ensured

**Given** movies are being filtered by trailer availability  
**When** the filtered list has fewer than 5 movies  
**Then** a warning SHALL be logged to the console  
**And** the application SHALL suggest loading more movies (future enhancement)

### Requirement: Randomization

Movie order SHALL be randomized to provide variety.

#### Scenario: Movies are shown in random order

**Given** a list of valid movies is loaded  
**When** the movies are processed for display  
**Then** the array SHALL be shuffled using random sort  
**And** each page load SHALL show movies in different order
