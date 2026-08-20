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

export type CareLogData = {
  id: string;
  outputMl: number;
  consistency: "watery" | "loose" | "usual" | "firm";
  hydrationMl: number;
  skinStatus: "comfortable" | "itchy" | "sore" | "broken";
  pain: number;
  leak: boolean;
  pouchChanged: boolean;
  food: string;
  symptoms: string;
  createdAt: string;
};

export type InventoryItemData = {
  id: string;
  name: string;
  productCode: string;
  quantity: number;
  reorderAt: number;
  unit: string;
};

export type CareTaskData = {
  id: string;
  category: "routine" | "appointment" | "travel" | "recovery";
  title: string;
  detail: string;
  dueDate: string;
  completed: boolean;
};

export type ContentSettingsData = {
  learningIntro: string;
  productHelp: string;
  safetyMessage: string;
};

export type AppData = {
  profile: ProfileData;
  checkins: CheckInData[];
  diaryEntries: DiaryEntryData[];
  supplyRequests: SupplyRequestData[];
  messages: MessageData[];
  careLogs: CareLogData[];
  inventory: InventoryItemData[];
  careTasks: CareTaskData[];
  content: ContentSettingsData;
};

export type AppAction =
  | { type: "save_checkin"; scores: number[] }
  | { type: "update_profile"; profile: Partial<ProfileData> }
  | { type: "request_supplies"; supplier: string; product?: string }
  | { type: "update_supply_status"; id: string; status: "Requested" | "Approved" | "Dispatched" | "Delivered" }
  | { type: "toggle_guide"; index: number }
  | { type: "send_message"; body: string; sender: "patient" | "nurse" }
  | { type: "add_diary_note"; title: string; detail: string }
  | { type: "save_care_log"; log: Omit<CareLogData, "id" | "createdAt"> }
  | { type: "adjust_inventory"; id: string; change: number }
  | { type: "add_inventory_item"; item: Omit<InventoryItemData, "id"> }
  | { type: "remove_inventory_item"; id: string }
  | { type: "toggle_care_task"; id: string }
  | { type: "add_care_task"; task: Omit<CareTaskData, "id" | "completed"> }
  | { type: "remove_care_task"; id: string }
  | { type: "update_content"; homeSubtitle: string; checkinHeading: string; learningIntro: string; productHelp: string; safetyMessage: string };
