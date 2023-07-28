import { Metadata } from "next";
import AboutView from "./View";

export const metadata: Metadata = {
  title: "Timeline - Thịnh's Corner",
};

export default function AboutPage() {
  return <AboutView />;
}
