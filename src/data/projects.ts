import type { ImageMetadata } from "astro";
import riftRecapCover from "@/assets/projects/covers/rift-recap.svg";
import skyMusicStudioCover from "@/assets/projects/covers/sky-music-studio.svg";
import vietnameseLegalDocumentsCover from "@/assets/projects/covers/vietnamese-legal-documents.svg";
import railboundCover from "@/assets/projects/covers/railbound.svg";
import haydayCover from "@/assets/projects/covers/hayday.svg";
import legalAiThesisCover from "@/assets/projects/covers/legal-ai-thesis.svg";
import travelFlowCover from "@/assets/projects/covers/travel-flow.svg";
import vaipeCover from "@/assets/projects/covers/vaipe.svg";
import athenaeduCover from "@/assets/projects/covers/athenaedu.svg";
import tictacmulCover from "@/assets/projects/covers/tictacmul.svg";

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
  /** Abstract cover drawn for this page (src/assets/projects/covers). */
  cover: ImageMetadata;
};

const gh = (repo: string): ProjectLink => ({
  label: "Source",
  href: `https://github.com/Th1nhNg0/${repo}`,
});

export const projects: Project[] = [
  {
    name: "Rift Recap",
    cover: riftRecapCover,
    summary:
      "A Discord bot that posts a scoreboard with everyone's LP change after each League game, plus daily, weekly and monthly recaps.",
    description:
      "A self-hosted Discord bot for my League of Legends squad. After each game it posts a scoreboard with everyone's LP change, plus daily, weekly and monthly recaps and optional AI commentary. One small Rust binary and a SQLite file.",
    kind: "Discord bot",
    stack: ["Rust", "SQLite", "Docker"],
    year: 2026,
    url: "https://github.com/Th1nhNg0/rift-recap",
    links: [gh("rift-recap")],
  },
  {
    name: "Sky Music Studio",
    cover: skyMusicStudioCover,
    summary:
      "Write and play songs on the instruments from Sky: Children of the Light, using only the keys each instrument really has.",
    description:
      "A browser app for writing and playing songs on the instruments from Sky: Children of the Light. It only uses the keys each instrument really has, imports MIDI, and saves songs in your browser.",
    kind: "Web app",
    stack: ["TypeScript", "React", "Web Audio"],
    year: 2026,
    url: "https://sky.thinhcorner.com",
    links: [{ label: "Open app", href: "https://sky.thinhcorner.com" }, gh("sky-song")],
  },
  {
    name: "Vietnamese Legal Documents",
    cover: vietnameseLegalDocumentsCover,
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
  },
  {
    name: "Railbound CP Solver",
    cover: railboundCover,
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
  },
  {
    name: "Hay Day Scheduler",
    cover: haydayCover,
    summary:
      "Plans Hay Day production as a flexible job shop problem, solved with OR-Tools and a genetic algorithm.",
    description:
      "Models Hay Day production as a Flexible Job Shop Scheduling Problem (FJSP) and solves it with Google OR-Tools and a genetic algorithm, including a web crawler for game data.",
    kind: "Optimization",
    stack: ["Python", "OR-Tools"],
    year: 2024,
    url: "https://github.com/Th1nhNg0/hayday",
    links: [{ label: "Write-up", href: "/writing/hayday-game-schedule" }, gh("hayday")],
  },
  {
    name: "Vietnamese Legal AI Thesis",
    cover: legalAiThesisCover,
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
    cover: travelFlowCover,
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
    cover: vaipeCover,
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
    cover: athenaeduCover,
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
    cover: tictacmulCover,
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

