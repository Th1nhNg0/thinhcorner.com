import type { ImageMetadata } from "astro";
import riftRecapScoreboard from "@/assets/projects/rift-recap-scoreboard.webp";
import skyMusicStudio from "@/assets/projects/sky-music-studio.webp";
import legalTimeline from "../../data/writing/phan-tich-van-ban-phap-luat/timeline_annotated.png";
import railboundBeforeAfter from "../../data/writing/railbound-constraint-solver/before-after.webp";
import haydaySchedule from "../../data/writing/hayday-game-schedule/machine_schedule.png";

export type ProjectLink = { label: string; href: string };

export type Project = {
  name: string;
  /** One line, shown on the page. */
  summary: string;
  /** Longer description, kept for structured data and future use. */
  description: string;
  kind: string;
  stack: string[];
  year: number;
  url: string;
  links: ProjectLink[];
} & ({ image: ImageMetadata; imageAlt: string } | { image?: undefined; imageAlt?: undefined });

const gh = (repo: string): ProjectLink => ({
  label: "Source",
  href: `https://github.com/Th1nhNg0/${repo}`,
});

export const projects: Project[] = [
  {
    name: "Rift Recap",
    summary:
      "A Discord bot that posts a scoreboard with everyone's LP change after each League game, plus daily, weekly and monthly recaps.",
    description:
      "A self-hosted Discord bot for my League of Legends squad. After each game it posts a scoreboard with everyone's LP change, plus daily, weekly and monthly recaps and optional AI commentary. One small Rust binary and a SQLite file.",
    kind: "Discord bot",
    stack: ["Rust", "SQLite", "Docker"],
    year: 2026,
    url: "https://github.com/Th1nhNg0/rift-recap",
    links: [gh("rift-recap")],
    image: riftRecapScoreboard,
    imageAlt: "A Rift Recap match scoreboard posted in Discord",
  },
  {
    name: "Sky Music Studio",
    summary:
      "Write and play songs on the instruments from Sky: Children of the Light, using only the keys each instrument really has.",
    description:
      "A browser app for writing and playing songs on the instruments from Sky: Children of the Light. It only uses the keys each instrument really has, imports MIDI, and saves songs in your browser.",
    kind: "Web app",
    stack: ["TypeScript", "React", "Web Audio"],
    year: 2026,
    url: "https://sky.thinhcorner.com",
    links: [{ label: "Open app", href: "https://sky.thinhcorner.com" }, gh("sky-song")],
    image: skyMusicStudio,
    imageAlt: "Sky Music Studio editing a violin melody, with the 15-key panel on the right",
  },
  {
    name: "Vietnamese Legal Documents",
    summary:
      "An open dataset of Vietnamese laws, decrees and circulars from 1945 to today, for NLP and legal AI work.",
    description:
      "A dataset of Vietnamese legal documents including laws, decrees, circulars, and other normative documents for NLP research and legal AI applications.",
    kind: "Dataset",
    stack: ["Python", "Hugging Face"],
    year: 2026,
    url: "https://huggingface.co/datasets/th1nhng0/vietnamese-legal-documents",
    links: [
      { label: "Dataset", href: "https://huggingface.co/datasets/th1nhng0/vietnamese-legal-documents" },
      { label: "Write-up", href: "/writing/phan-tich-van-ban-phap-luat" },
    ],
    image: legalTimeline,
    imageAlt:
      "Line chart of Vietnamese legal documents issued per year from 1945 to 2025, with historical milestones marked",
  },
  {
    name: "Railbound CP Solver",
    summary:
      "Solves Railbound puzzles by modelling tracks, trains, switches and gates as a constraint problem.",
    description:
      "A constraint programming solver for the Railbound puzzle game using MiniZinc and OR-Tools. Models track placement, train movement, switches, and gates as a constraint satisfaction problem.",
    kind: "Solver",
    stack: ["MiniZinc", "OR-Tools", "Python"],
    year: 2025,
    url: "https://github.com/Th1nhNg0/railbound_cp",
    links: [
      { label: "Write-up", href: "/writing/railbound-constraint-solver" },
      gh("railbound_cp"),
    ],
    image: railboundBeforeAfter,
    imageAlt: "A Railbound puzzle on the left and the track layout the solver found on the right",
  },
  {
    name: "Hay Day Scheduler",
    summary:
      "Plans Hay Day production as a flexible job shop problem, solved with OR-Tools and a genetic algorithm.",
    description:
      "Models Hay Day production as a Flexible Job Shop Scheduling Problem (FJSP) and solves it with Google OR-Tools and a genetic algorithm, including a web crawler for game data.",
    kind: "Optimization",
    stack: ["Python", "OR-Tools"],
    year: 2024,
    url: "https://github.com/Th1nhNg0/hayday",
    links: [{ label: "Write-up", href: "/writing/hayday-game-schedule" }, gh("hayday")],
    image: haydaySchedule,
    imageAlt: "Gantt chart of a Hay Day production schedule across fields, a feed mill and a chicken coop",
  },
  {
    name: "Vietnamese Legal AI Thesis",
    summary:
      "Bachelor thesis on legal question answering in Vietnamese with BM25, dense embeddings and RAG. Graded 9.7/10.",
    description:
      "Bachelor thesis on Vietnamese legal question answering using BM25, TF-IDF, ChromaDB, dense embeddings, Instructor model fine-tuning, and RAG (final score 9.7/10).",
    kind: "Research",
    stack: ["Python", "ChromaDB", "RAG"],
    year: 2023,
    url: "https://github.com/Th1nhNg0/vietnamese-legal-ai-thesis",
    links: [gh("vietnamese-legal-ai-thesis")],
  },
  {
    name: "Travel Flow",
    summary: "A travel planning app with map-based discovery. First prize at UIT Web Adventure 2022.",
    description:
      "First-prize UIT Web Adventure 2022 mobile app for Travel Flow. Built with Expo and React Native, with authentication, location permissions, map-based travel discovery, location details, and trip plan detail screens.",
    kind: "Mobile app",
    stack: ["React Native", "Expo"],
    year: 2022,
    url: "https://github.com/Th1nhNg0/travel_flow_hackathon",
    links: [gh("travel_flow_hackathon")],
  },
  {
    name: "VAIPE 2022",
    summary: "Reads a prescription photo and recognises the pills in it, for the VAIPE 2022 challenge.",
    description:
      "Medicine pill image recognition challenge pipeline using Tesseract OCR for prescriptions, U-2-Net preprocessing, YOLOv5 object detection, and ResNet50 classification, with Dockerized training and inference scripts.",
    kind: "Computer vision",
    stack: ["YOLOv5", "ResNet50", "OCR"],
    year: 2022,
    url: "https://github.com/Th1nhNg0/VAIPE-2022",
    links: [gh("VAIPE-2022")],
  },
  {
    name: "AthenaEdu",
    summary: "A quiz and study platform with multiplayer rooms and a forum, built at SPKT Hackathon 2020.",
    description:
      "SPKT Hackathon 2020 education platform using Vue, Firebase, Express, and Socket.IO. Includes login, quiz categories, single-player practice, multiplayer quiz rooms, forum questions, and rankings.",
    kind: "Web app",
    stack: ["Vue", "Firebase", "Socket.IO"],
    year: 2020,
    url: "https://github.com/Th1nhNg0/athenaedu-spkt-hackathon",
    links: [gh("athenaedu-spkt-hackathon")],
  },
  {
    name: "TicTacMul",
    summary: "Realtime multiplayer tic-tac-toe with rooms.",
    description:
      "A realtime multiplayer tic-tac-toe game built with Vue, Node.js, Express, and Socket.IO, including room-based play and a bundled Vue client served by the Node backend.",
    kind: "Game",
    stack: ["Vue", "Node.js", "Socket.IO"],
    year: 2019,
    url: "https://github.com/Th1nhNg0/tic-tac-toe-multiplayer",
    links: [gh("tic-tac-toe-multiplayer")],
  },
];

type ProjectWithImage = Extract<Project, { image: ImageMetadata }>;

/** Projects with a screenshot, shown as the gallery. */
export const selected = projects.filter((p): p is ProjectWithImage => Boolean(p.image));
/** Projects without one, shown in the "Earlier" list. */
export const earlier = projects.filter((p) => !p.image);
