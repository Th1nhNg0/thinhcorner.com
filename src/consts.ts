// Configuration for all social media profile URLs
const PERSONAL_SOCIAL_PROFILES: {
  github?: string;
  facebook?: string;
  steam?: string;
  spotify?: string;
} = {
  github: "https://github.com/th1nhng0",
  facebook: "https://www.facebook.com/Th1nhNg0",
  steam: "https://steamcommunity.com/id/th1nhng0",
  spotify: "https://open.spotify.com/user/21acs5sngq2xkehugtvqkwmuy",
};

// Core website metadata for SEO and display
const WEBSITE_CONFIG = {
  title: "Thinh's Corner",
  description: "Ngô Phú Thịnh's personal blog",
};

// External reading profile URL for book recommendations integration
export const GOODREADS_USER_URL = "https://www.goodreads.com/th1nhng0";

// Export constants with descriptive aliases
export { PERSONAL_SOCIAL_PROFILES as SOCIAL_MEDIA, WEBSITE_CONFIG as SITE };

// GitHub repository URL for blog content source
export const GITHUB_CONTENT_SOURCE = "https://github.com/th1nhng0/thinhcorner.com/tree/master/src/content/blog";
