## ADDED Requirements

### Requirement: Add Movie to Favorites

The system SHALL save a movie to favorites when user swipes right or taps the heart icon.

#### Scenario: Swipe right adds to favorites

- **WHEN** user swipes right on a movie card
- **THEN** the movie is added to favorites in LocalStorage
- **AND** visual feedback confirms the action ("❤️ Добавлено в избранное")

#### Scenario: Heart icon toggle

- **WHEN** user taps the heart icon on a movie card
- **THEN** the movie is added to favorites if not already saved
- **OR** removed from favorites if already saved
- **AND** the heart icon state updates immediately (filled vs outline)

### Requirement: Persist Favorites in LocalStorage

The system SHALL store favorite movie IDs in browser LocalStorage.

#### Scenario: Save to LocalStorage

- **WHEN** a movie is added to favorites
- **THEN** the system stores the movie ID in LocalStorage array
- **AND** persists across browser sessions

#### Scenario: Load favorites on app start

- **WHEN** the application initializes
- **THEN** the system reads favorites from LocalStorage
- **AND** restores the favorites state

### Requirement: Remove from Favorites

The system SHALL allow users to remove movies from their favorites list.

#### Scenario: Remove via heart icon

- **WHEN** user taps the heart icon on a favorited movie
- **THEN** the movie is removed from favorites
- **AND** the heart icon changes to outline state

#### Scenario: Remove from favorites view

- **WHEN** user removes a movie from the Favorites page
- **THEN** the system deletes it from LocalStorage
- **AND** updates the favorites list immediately

### Requirement: Display Favorites List

The system SHALL display all favorited movies in a dedicated Favorites view.

#### Scenario: View favorites page

- **WHEN** user navigates to the Favorites tab
- **THEN** the system displays a list/grid of all saved movies
- **AND** shows movie posters and titles

#### Scenario: Empty favorites state

- **WHEN** user has no favorites yet
- **THEN** the system displays an empty state message
- **AND** suggests swiping right to add favorites

### Requirement: Check Favorite Status

The system SHALL indicate whether the current movie is already in favorites.

#### Scenario: Show favorite indicator

- **WHEN** displaying a movie card
- **THEN** the system checks if the movie is in favorites
- **AND** displays a filled heart icon if favorited, outline if not

#### Scenario: Prevent duplicate favorites

- **WHEN** user tries to favorite an already-favorited movie
- **THEN** the system does not create a duplicate entry
- **AND** maintains a single entry in LocalStorage

### Requirement: Favorites Data Structure

The system SHALL store favorites as an array of movie IDs with minimal metadata.

#### Scenario: Efficient storage

- **WHEN** saving favorites
- **THEN** the system stores only movie IDs (not full movie objects)
- **AND** fetches full movie data when displaying the Favorites page

#### Scenario: Handle storage limits

- **WHEN** LocalStorage approaches size limits
- **THEN** the system handles errors gracefully
- **AND** optionally implements cleanup of oldest favorites

### Requirement: Favorites Count Display

The system SHALL display the total count of favorite movies.

#### Scenario: Show favorites count

- **WHEN** user views the Favorites tab
- **THEN** the system displays the total number of saved movies
- **AND** updates the count in real-time as favorites change
