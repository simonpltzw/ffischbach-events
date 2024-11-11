import { useEventSettings } from "@/context/eventSettings";
import { ExportEntry } from "@/models/ExportEntry";
import { Event } from "@/models/in/Event";
import { decryptGroup } from "./decryptService";
import { Group } from "@/models/in/Group";
import { decryptKeyWithPassword } from "./passwordService";
import useToken from "./tokenService";
import { Participant } from "@/models/in/Participant";
import { useGroupService } from "./groupsService";

export const useJsonToCsv = () => {
  const [eventSettings] = useEventSettings();
  const { getToken } = useToken();
  const {getGroup} = useGroupService()

  //https://www.geeksforgeeks.org/how-to-convert-json-object-to-csv-in-javascript/
  const jsonToCsv = (jsonDataList: any[]) => {
    let csv = "";

    if (!(jsonDataList.length && jsonDataList[0].length)) {
      return csv;
    }

    // Extract headers
    const headers = Object.keys(jsonDataList[0][0]);
    csv += headers.join(";") + "\n";

    for (let jsonData of jsonDataList) {
      // Extract values
      jsonData.forEach((obj: any) => {
        const values = headers.map((header) => obj[header]);
        csv += values.join(";") + "\n";
      });
    }

    return csv;
  };

  const parse = async (event: Event) => {
    const privateKey = decryptKeyWithPassword(event.encryptedPrivateKey, eventSettings.password!);

    const result = await Promise.all(
      event
        .groups!.filter((g: Group) => g.approved)
        .map(async (g: Group) => {
          const group = await getGroup( g.id);
          const decGroup: Group = await decryptGroup(group, { privateKey });
          delete decGroup.contact.encryptedData;

          const contact = decGroup.contact;

          const contactExport: ExportEntry = {
            Vorname: contact.FirstName,
            Nachname: contact.LastName,
            Gruppe: decGroup.name,
            Gr: decGroup.id,
            Nr: contact.id,
            KategorieNr: decGroup.category.id,
            Kategorie: decGroup.category?.name ?? "",
          };

          const participantsExport = decGroup.participants.map((p: Participant) => {
            delete p.encryptedData;

            const exportData: ExportEntry = {
              Vorname: p.FirstName,
              Nachname: p.LastName,
              Gruppe: decGroup.name,
              Gr: decGroup.id,
              Nr: p.id,
              KategorieNr: decGroup.category.id,
              Kategorie: decGroup.category?.name ?? "",
            };

            return exportData;
          });

          participantsExport.push(contactExport);
          return participantsExport;
        })
    );
    return jsonToCsv(result);
  };

  return {
    parse,
  };
};
