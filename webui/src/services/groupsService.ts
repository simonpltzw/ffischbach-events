import { Group } from "@/models/in/Group";
import { encryptData, importPublicKey } from "./publicKeyService";
import { GroupOut } from "@/models/out/GroupOut";
import { ParticipantOut } from "@/models/out/ParticipantOut";
import { Participant } from "@/models/in/Participant";
import useClientFetch from "./fetch";

export const useGroupService = () => {
  const {get, getOne, post, put, _delete} = useClientFetch()

  const getGroup = async (groupId: number) => {
    return getOne(`/Groups/${groupId}`)
  };

  const updateGroup = async (group: Group) => {
    const publicKey: CryptoKey = await importPublicKey(group.event!.publicKey!);

    const encryptedGroupName: string = await encryptData(group.name, publicKey);
    const encryptedContactData: string = await encryptData(
      JSON.stringify(group.contact),
      publicKey
    );

    const contactOut = new ParticipantOut(
      encryptedContactData,
      group.contact.id,
      group.contact.vip
    );

    const participantsOut: ParticipantOut[] = await Promise.all(
      group.participants.map(async (p: Participant) => {
        const data = {
          BirthDate: p.BirthDate,
          Email: null,
          FirstName: p.FirstName,
          LastName: p.LastName,
        };

        const encryptedParticipantData: string = await encryptData(JSON.stringify(data), publicKey);
        return new ParticipantOut(encryptedParticipantData, p.id, p.vip);
      })
    );

    const groupOut = new GroupOut(
      group.hashedName,
      group.event!.id,
      encryptedGroupName,
      group.category.id,
      group.approved,
      contactOut,
      participantsOut
    );


    return put(`/Groups/${group.id}`, groupOut)
  };

  return {
    getGroup,
    updateGroup
  }
};
