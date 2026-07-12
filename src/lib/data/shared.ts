import { isMockDataMode } from "@/lib/config";
import { mockStore } from "@/lib/mock/store";
import {
  heroBlocks,
  type User,
  type Product,
  type Location,
  type EducationArticle,
  type LandingPage,
  type Survey,
  type SurveyQuestion,
  type QrCode,
  aboutSections,
} from "@/lib/db/schema";

export type HeroBlock = typeof heroBlocks.$inferSelect;
export type AboutSection = typeof aboutSections.$inferSelect;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "admin" | "staff" | "ambassador";
};

export function now() {
  return new Date();
}

export function isLocalMockMode(): boolean {
  return isMockDataMode();
}

export const mockHeroes = () => mockStore.heroes as HeroBlock[];
export const mockProducts = () => mockStore.products as Product[];
export const mockLocations = () => mockStore.locations as Location[];
export const mockEducationArticles = () => mockStore.educationArticles as EducationArticle[];
export const mockAboutSections = () => mockStore.aboutSections as AboutSection[];
export const mockLandingPages = () => mockStore.landingPages as LandingPage[];
export const mockSurveys = () => mockStore.surveys as Survey[];
export const mockSurveyQuestions = () => mockStore.surveyQuestions as SurveyQuestion[];
export const mockQrCodes = () => mockStore.qrCodes as QrCode[];
export const mockUsers = () => mockStore.users as User[];

export { isMockDataMode, isDatabaseConfigured } from "@/lib/config";
export { DEFAULT_HERO_YOUTUBE_URL } from "@/lib/hero-video";
