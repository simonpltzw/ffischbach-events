import { Group } from "@/models/in/Group";
import axios from "axios";
import { encryptData, importPublicKey } from "./publicKeyService";
import { GroupOut } from "@/models/out/GroupOut";
import { ParticipantOut } from "@/models/out/ParticipantOut";
import { Participant } from "@/models/in/Participant";

export const getGroup = async (token: string, groupId: string) => {
  const response = await axios.get<Group>(`${process.env.NEXT_PUBLIC_WEB_API}/Groups/${groupId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return response.data;
};

export const updateGroup = async (token: string, group: Group) => {
  const publicKey: CryptoKey = await importPublicKey(group.event!.publicKey!);

  const encryptedGroupName: string = await encryptData(group.name, publicKey);
  const encryptedContactData: string = await encryptData(JSON.stringify(group.contact), publicKey);

  const contactOut = new ParticipantOut(encryptedContactData, group.contact.id, group.contact.vip);

  const participantsOut: ParticipantOut[] = await Promise.all(
    group.participants.map(async (p: Participant) => {
      const data = {
        BirthDate: p.BirthDate,
        Email: null,
        FirstName: p.FirstName,
        LastName: p.LastName,
      };

      const encryptedParticipantData: string = await encryptData(JSON.stringify(data), publicKey);
      return new ParticipantOut(encryptedParticipantData, p.id);
    })
  );

  const groupOut = new GroupOut(
    group.hashedName,
    group.event!.id,
    encryptedGroupName,
    group.category,
    group.approved,
    contactOut,
    participantsOut
  );

  const response = await axios.put<any>(`${process.env.NEXT_PUBLIC_WEB_API}/Groups/${group.id}`, 
    groupOut,
    {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return response.data;
};
