import { useEventSettings } from "@/context/eventSettingsContext";
import { ExportEntry } from "@/models/ExportEntry";
import { Event } from "@/models/in/Event";
import { decryptGroup } from "./decryptService";
import { Group } from "@/models/in/Group";
import { decryptKeyWithPassword } from "./passwordService";
import { getGroup } from "./groupsService";
import useToken from "./tokenService";
import { Participant } from "@/models/in/Participant";


export const useJsonToCsv = () => {
  const [eventSettings] = useEventSettings();
  const { getToken } = useToken();


  //https://www.geeksforgeeks.org/how-to-convert-json-object-to-csv-in-javascript/
  const jsonToCsv = (jsonData: any) => {
    let csv = "";

    // Extract headers
    const headers = Object.keys(jsonData[0]);
    csv += headers.join(";") + "\n";

    // Extract values
    jsonData.forEach((obj: any) => {
      const values = headers.map((header) => obj[header]);
      csv += values.join(";") + "\n";
    });

    return csv;
  };

  const parse = async (event: Event) => {
    const privateKey = decryptKeyWithPassword(event.encryptedPrivateKey, eventSettings.password!);

    const token = await getToken();
    const result = await Promise.all(
      event.groups!.map(async (g: Group) => {
        const group = await getGroup(token, g.id);

        const decGroup: Group = await decryptGroup(group, { privateKey });

        delete decGroup.contact.encryptedData;
        decGroup.participants.forEach((p: Participant) => {
          delete p.encryptedData;
        });

        const exportData: ExportEntry = {
          Anzahl: decGroup.participants.length,
          Kategorie: decGroup.category,
          Ansprechpartner: `${decGroup.contact.FirstName} ${decGroup.contact.LastName}`,
          groupId: decGroup.id,
          Gruppe: decGroup.name,
          internerKontakt: "",
        };

        return exportData;
      })
    );
  
    console.log(jsonToCsv(result))
    return jsonToCsv(result)
  };

  return {
    parse,
  };
};