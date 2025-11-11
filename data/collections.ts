/**
 * Curated movie collections - Letterboxd style
 * Each collection contains 10-20 handpicked movies
 */

export interface Collection {
  id: string;
  title: string;
  description: string;
  tagline: string;
  theme: 'inspirational' | 'dark' | 'comedy' | 'action' | 'scifi' | 'romantic' | 'thriller' | 'drama' | 'oscar' | 'hidden';
  movieIds: number[]; // TMDB movie IDs
}

export const collections: Collection[] = [
  {
    id: 'before-you-die',
    title: 'Movies You Need to Watch Before You Die',
    description: 'Timeless masterpieces that define cinema. From classics to modern marvels, these films are essential viewing for any movie lover.',
    tagline: 'Essential Cinema',
    theme: 'drama',
    movieIds: [
      278,    // The Shawshank Redemption
      238,    // The Godfather
      240,    // The Godfather Part II
      424,    // Schindler's List
      389,    // 12 Angry Men
      129,    // Spirited Away
      19404,  // Dilwale Dulhania Le Jayenge
      372058, // Your Name
      497,    // The Green Mile
      496243, // Parasite
      13,     // Forrest Gump
      680,    // Pulp Fiction
      155,    // The Dark Knight
      122,    // The Lord of the Rings: The Return of the King
      637,    // Life Is Beautiful
    ],
  },
  {
    id: 'feel-good',
    title: 'Feel-Good Escapes',
    description: 'Uplifting, heartwarming films that will brighten your day. Perfect for when you need a mood boost or a cozy movie night.',
    tagline: 'Pure Joy',
    theme: 'inspirational',
    movieIds: [
      13,     // Forrest Gump
      920,    // Cars
      12444,  // Harry Potter and the Deathly Hallows: Part 1
      862,    // Toy Story
      863,    // Toy Story 2
      10681,  // WALL·E
      14160,  // Up
      278154, // The Intern
      293660, // Deadpool
      508442, // Soul
      508943, // Luca
      585511, // Puss in Boots: The Last Wish
      447332, // A Quiet Place
      420817, // Aladdin
    ],
  },
  {
    id: 'mind-bending',
    title: 'Mind-Bending Thrillers',
    description: 'Psychological twists and turns that will keep you guessing until the very end. Prepare to have your perception of reality challenged.',
    tagline: 'Question Everything',
    theme: 'thriller',
    movieIds: [
      27205,  // Inception
      157336, // Interstellar
      155,    // The Dark Knight
      550,    // Fight Club
      77,     // Memento
      539,    // Psycho
      73,     // American History X
      807,    // Se7en
      510,    // One Flew Over the Cuckoo's Nest
      629,    // The Usual Suspects
      769,    // GoodFellas
      820,    // Grave of the Fireflies
      15121,  // The Sixth Sense
      106646, // The Wolf of Wall Street
    ],
  },
  {
    id: 'epic-scifi',
    title: 'Epic Sci-Fi Journeys',
    description: 'Space operas and futuristic worlds that expand the boundaries of imagination. From distant galaxies to alternate realities.',
    tagline: 'Beyond Reality',
    theme: 'scifi',
    movieIds: [
      27205,  // Inception
      157336, // Interstellar
      78,     // Blade Runner
      329865, // Arrival
      76341,  // Mad Max: Fury Road
      603,    // The Matrix
      62,     // 2001: A Space Odyssey
      424,    // Schindler's List (mixed genre)
      209112, // Batman v Superman: Dawn of Justice
      429617, // Spider-Man: No Way Home
      99861,  // Avengers: Age of Ultron
      271110, // Captain America: Civil War
      315635, // Spider-Man: Homecoming
      181808, // Star Wars: The Last Jedi
    ],
  },
  {
    id: 'romantic-classics',
    title: 'Romantic Classics',
    description: 'Timeless love stories that have captured hearts for generations. From sweeping epics to intimate tales of connection.',
    tagline: 'Love Never Dies',
    theme: 'romantic',
    movieIds: [
      19404,  // Dilwale Dulhania Le Jayenge
      11216,  // Cinema Paradiso
      372058, // Your Name
      550,    // Fight Club (unconventional romance)
      274,    // The Silence of the Lambs
      680,    // Pulp Fiction
      13,     // Forrest Gump
      637,    // Life Is Beautiful
      129,    // Spirited Away
      389,    // 12 Angry Men
      761053, // Gabriel's Inferno: Part III
      606856, // Miraculous World: New York, United HeroeZ
      654,    // On the Waterfront
      11324,  // Shutter Island
    ],
  },
  {
    id: 'dark-disturbing',
    title: 'Dark & Disturbing',
    description: 'Psychological horror and dark themes that push the boundaries. Not for the faint of heart, these films explore humanity\'s shadows.',
    tagline: 'Enter the Darkness',
    theme: 'dark',
    movieIds: [
      539,    // Psycho
      274,    // The Silence of the Lambs
      807,    // Se7en
      694,    // The Shining
      745,    // The Sixth Sense
      11324,  // Shutter Island
      1891,   // The Empire Strikes Back
      120,    // The Lord of the Rings: The Fellowship of the Ring
      121,    // The Lord of the Rings: The Two Towers
      122,    // The Lord of the Rings: The Return of the King
      79091,  // The Judge
      286217, // The Martian
      268896, // Avengers: Infinity War
      299536, // Avengers: Endgame
    ],
  },
  {
    id: 'laugh-out-loud',
    title: 'Laugh-Out-Loud Comedies',
    description: 'The funniest films ever made. From slapstick to satire, these movies guarantee non-stop laughter.',
    tagline: 'Pure Comedy Gold',
    theme: 'comedy',
    movieIds: [
      293660, // Deadpool
      293167, // Kung Fu Panda 3
      9479,   // The Naked Gun: From the Files of Police Squad!
      10195,  // Thor
      1930,   // The Amazing Spider-Man
      566525, // Shang-Chi and the Legend of the Ten Rings
      284053, // Thor: Ragnarok
      284054, // Black Panther
      335983, // Venom
      335984, // Blade Runner 2049
      521777, // Godzilla vs. Kong
      460465, // Mortal Kombat
      438631, // Dune
      624860, // The Matrix Resurrections
    ],
  },
  {
    id: 'action-adventures',
    title: 'Action-Packed Adventures',
    description: 'Non-stop thrills and spectacular stunts. Adrenaline-pumping action from start to finish.',
    tagline: 'Edge of Your Seat',
    theme: 'action',
    movieIds: [
      155,    // The Dark Knight
      76341,  // Mad Max: Fury Road
      12,     // Finding Nemo
      120,    // The Lord of the Rings: The Fellowship of the Ring
      121,    // The Lord of the Rings: The Two Towers
      122,    // The Lord of the Rings: The Return of the King
      1891,   // The Empire Strikes Back
      11,     // Star Wars
      1892,   // Return of the Jedi
      140607, // Star Wars: The Force Awakens
      181808, // Star Wars: The Last Jedi
      181812, // Star Wars: The Rise of Skywalker
      284052, // Doctor Strange
      429617, // Spider-Man: No Way Home
    ],
  },
  {
    id: 'oscar-winners',
    title: 'Oscar Winners Collection',
    description: 'Academy Award Best Picture winners that defined their eras. Critically acclaimed masterpieces recognized by the industry.',
    tagline: 'Award-Winning Excellence',
    theme: 'oscar',
    movieIds: [
      238,    // The Godfather
      240,    // The Godfather Part II
      424,    // Schindler's List
      122,    // The Lord of the Rings: The Return of the King
      496243, // Parasite
      13,     // Forrest Gump
      274,    // The Silence of the Lambs
      389,    // 12 Angry Men
      637,    // Life Is Beautiful
      278,    // The Shawshank Redemption
      155,    // The Dark Knight
      680,    // Pulp Fiction
      769,    // GoodFellas
      820,    // Grave of the Fireflies
    ],
  },
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    description: 'Underrated masterpieces that deserve more recognition. Discover incredible films that flew under the radar.',
    tagline: 'Discover the Undiscovered',
    theme: 'hidden',
    movieIds: [
      11216,  // Cinema Paradiso
      129,    // Spirited Away
      820,    // Grave of the Fireflies
      372058, // Your Name
      19404,  // Dilwale Dulhania Le Jayenge
      637,    // Life Is Beautiful
      497,    // The Green Mile
      389,    // 12 Angry Men
      510,    // One Flew Over the Cuckoo's Nest
      629,    // The Usual Suspects
      15121,  // The Sixth Sense
      79091,  // The Judge
      508442, // Soul
      508943, // Luca
    ],
  },
];

/**
 * Get collection by ID
 */
export function getCollectionById(id: string): Collection | undefined {
  return collections.find(c => c.id === id);
}

/**
 * Get all collections
 */
export function getAllCollections(): Collection[] {
  return collections;
}

/**
 * Get collections by theme
 */
export function getCollectionsByTheme(theme: Collection['theme']): Collection[] {
  return collections.filter(c => c.theme === theme);
}
