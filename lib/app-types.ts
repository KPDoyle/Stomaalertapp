export type ProfileData = {
  firstName: string;
  email: string;
  stomaType: string;
  duration: string;
  dateCreated: string;
  nurse: string;
  supplier: string;
  products: string[];
  learning: boolean[];
  homeSubtitle: string;
  checkinHeading: string;
};

export type CheckInData = {
  id: string;
  output: number;
  skin: number;
  comfort: number;
  mood: number;
  createdAt: string;
};

export type DiaryEntryData = {
  id: string;
  type: "checkin" | "photo" | "note";
  title: string;
  detail: string;
  fileKey: string | null;
  fileName: string | null;
  createdAt: string;
};

export type SupplyRequestData = {
  id: string;
  supplier: string;
  product: string;
  status: string;
  createdAt: string;
};

export type MessageData = {
  id: string;
  sender: "patient" | "nurse";
  body: string;
  createdAt: string;
};

export type AppData = {
  profile: ProfileData;
  checkins: CheckInData[];
  diaryEntries: DiaryEntryData[];
  supplyRequests: SupplyRequestData[];
  messages: MessageData[];
};

export type AppAction =
  | { type: "save_checkin"; scores: number[] }
  | { type: "update_profile"; profile: Partial<ProfileData> }
  | { type: "request_supplies"; supplier: string }
  | { type: "toggle_guide"; index: number }
  | { type: "send_message"; body: string; sender: "patient" | "nurse" }
  | { type: "update_content"; homeSubtitle: string; checkinHeading: string };
