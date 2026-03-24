// Personal information
export const AUTHOR_NAME = "Ngô Phú Thịnh";
export const AUTHOR_EMAIL = "thinhngow@gmail.com";

// Configuration for all social media profile URLs
const PERSONAL_SOCIAL_PROFILES: {
  github?: string;
  facebook?: string;
  spotify?: string;
  linkedin?: string;
} = {
  github: "https://github.com/th1nhng0",
  facebook: "https://www.facebook.com/Th1nhNg0",
  spotify: "https://open.spotify.com/user/21acs5sngq2xkehugtvqkwmuy",
  linkedin: "https://www.linkedin.com/in/th1nhng0/",
};

// Core website metadata for SEO and display
const WEBSITE_CONFIG = {
  title: "Thinh's Corner",
  description: "Ngô Phú Thịnh's personal blog",
};

// Goodreads integration
export const GOODREADS_USER_ID = "161740636";
export const GOODREADS_USER_URL = "https://www.goodreads.com/th1nhng0";

// Export constants with descriptive aliases
export { PERSONAL_SOCIAL_PROFILES as SOCIAL_MEDIA, WEBSITE_CONFIG as SITE };

// GitHub repository URL for blog content source
export const GITHUB_CONTENT_SOURCE =
  "https://github.com/th1nhng0/thinhcorner.com/tree/master/src/content/blog";
export const GOOGLE_ANALYTICS_ID = "G-P4B7XCWCYP";
