// RAWG API integration for gaming statistics
// Fetches real gaming data from RAWG.io user profile

interface RAWGGame {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings: Array<{
    id: number;
    title: string;
    count: number;
    percent: number;
  }>;
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status: {
    yet: number;
    owned: number;
    beaten: number;
    toplay: number;
    dropped: number;
    playing: number;
  };
  metacritic: number | null;
  playtime: number;
  suggestions_count: number;
  updated: string;
  user_game: any;
  community_rating: number;
  user_rating: number;
  reviews_count: number;
  saturated_color: string;
  dominant_color: string;
  platforms: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
      image: string | null;
      year_end: number | null;
      year_start: number | null;
      games_count: number;
      image_background: string;
    };
    released_at: string;
    requirements_en: any;
    requirements_ru: any;
  }>;
  parent_platforms: Array<{
    platform: {
      id: number;
      name: string;
      slug: string;
    };
    selected: boolean;
  }>;
  genres: Array<{
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
  }>;
  stores: Array<{
    id: number;
    store: {
      id: number;
      name: string;
      slug: string;
      domain: string;
      games_count: number;
      image_background: string;
    };
  }>;
  clip: any;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    language: string;
    games_count: number;
    image_background: string;
  }>;
  esrb_rating: {
    id: number;
    name: string;
    slug: string;
  } | null;
  short_screenshots: Array<{
    id: number;
    image: string;
  }>;
}

interface GameWithDetails {
  id: number;
  name: string;
  slug: string;
  imageUrl: string;
  storeUrl: string;
  hoursPlayed: number;
  rating: number;
  metacritic: number | null;
  released: string;
  genres: string[];
  platforms: string[];
}

interface RAWGResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RAWGGame[];
  counters: {
    owned: number;
    playing: number;
    toplay: number;
    beaten: number;
    dropped: number;
    yet: number;
    uncategorized: number;
  };
}

const RAWG_API_BASE = "https://api.rawg.io/api";
const RAWG_USERNAME = "th1nhng0";

export async function getAllGames(): Promise<RAWGGame[]> {
  try {
    let allGames: RAWGGame[] = [];
    let nextUrl:
      | string
      | null = `${RAWG_API_BASE}/users/${RAWG_USERNAME}/games`;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status}`);
      }

      const data: RAWGResponse = await response.json();
      allGames = allGames.concat(data.results);
      nextUrl = data.next;
    }

    return allGames;
  } catch (error) {
    console.error("Error fetching RAWG data:", error);
    return [];
  }
}
