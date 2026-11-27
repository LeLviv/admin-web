export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EventResponse {
  id: number;
  title: string;
  host: string;
  thumbnailUrl: string | null;
  description: string | null;
  createdAt: string;
  eventStart: string;
  eventEnd: string | null;
  location: string;
  price: number;
  url: string | null;
}

export interface EventRequestPayload {
  title: string;
  host: string;
  description?: string;
  eventStart: string;
  eventEnd?: string | null;
  location: string;
  price: number;
  url?: string;
}

export type SurveyStatus = "ACTIVE" | "CANCELED" | "EXPIRED";

export interface SurveyOptionDto {
  position: number;
  option: string;
  votesCount: number;
}

export interface SurveyResponseDto {
  id: number;
  title: string;
  question: string;
  startTime: string;
  endTime: string;
  surveyStatus: SurveyStatus | string;
  options: SurveyOptionDto[];
}

export interface MakeSurveyRequestPayload {
  title: string;
  question: string;
  startTime: string;
  endTime: string;
  options: string[];
}

export interface ComplaintDto {
  id: number;
  author: string;
  problem: string;
  photoPath: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export const ALERT_TYPES = [
  "AIR",
  "ARTILLERY",
  "URBAN_FIGHTS",
  "CHEMICAL",
  "NUCLEAR",
  "INFO",
  "CUSTOM",
] as const;

export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_STATUSES = ["UNKNOWN", "NONE", "YELLOW", "RED"] as const;

export type AlertStatus = (typeof ALERT_STATUSES)[number];
