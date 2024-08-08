import { EventSettings } from "@/models/EventSettings";
import { AES } from "crypto-js";

const name = "eventSetting";

export const resetEventSettings = () => {
  sessionStorage.setItem(name, "");
};

export const setEventSettings = (token: string, eventSettings: EventSettings) => {
  const encEventSetting = AES.encrypt(JSON.stringify(eventSettings), token).toString();
  sessionStorage.setItem(name, encEventSetting);
};

export const getEventSettings = (token: string): EventSettings | undefined => {
  const setting = sessionStorage.getItem(name);
  if (setting) {
    const encEventSetting = AES.decrypt(setting, token).toString(CryptoJS.enc.Utf8);
    return JSON.parse(encEventSetting) as EventSettings;
  }
};
